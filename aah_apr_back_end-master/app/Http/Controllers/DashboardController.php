<?php

namespace App\Http\Controllers;

use App\Models\Apr;
use App\Models\Beneficiary;
use App\Models\Project;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    private const CACHE_MINUTES = 5;

    private const SUBMITTED_STATUSES = ['submitted', 'resubmitted'];
    private const REVIEW_STATUSES = ['aprGenerated', 'fourthRejected'];
    private const VALIDATION_STATUSES = ['reviewed'];
    private const APPROVED_STATUSES = ['firstApproved', 'secondApproved'];
    private const REJECTED_STATUSES = ['firstRejected', 'secondRejected', 'thirdRejected', 'fourthRejected'];

    public function overview()
    {
        $user = Auth::user();
        $permissionSignature = md5($user->getAllPermissions()->pluck('name')->sort()->implode('|'));
        $cacheKey = "dashboard.overview.{$user->id}.{$permissionSignature}";

        $data = Cache::remember($cacheKey, now()->addMinutes(self::CACHE_MINUTES), function () use ($user) {
            return [
                'kpis' => $this->kpis(),
                'workflow' => $this->workflow(),
                'projects' => $this->projects(),
                'queues' => $this->queues($user),
                'notifications' => $this->notifications($user),
            ];
        });

        return response()->json([
            'status' => true,
            'message' => '',
            'data' => $data,
        ], 200);
    }

    private function kpis(): array
    {
        return [
            'totalProjects' => Project::count(),
            'activeProjects' => Project::where('status', 'ongoing')->count(),
            'totalBeneficiaries' => Beneficiary::count(),
            'aprIncludedBeneficiaries' => Beneficiary::where('aprIncluded', true)->count(),
            'pendingSubmittedDatabases' => Apr::whereIn('status', self::SUBMITTED_STATUSES)->count(),
            'pendingAprReviews' => Apr::whereIn('status', self::REVIEW_STATUSES)->count(),
        ];
    }

    private function workflow(): array
    {
        $counts = Apr::query()
            ->selectRaw("
                COUNT(CASE WHEN status IN ('submitted', 'resubmitted') THEN 1 END) as submitted,
                COUNT(CASE WHEN status IN ('aprGenerated', 'reviewed', 'fourthRejected') THEN 1 END) as under_review,
                COUNT(CASE WHEN status IN ('firstApproved', 'secondApproved') THEN 1 END) as approved,
                COUNT(CASE WHEN status IN ('firstRejected', 'secondRejected', 'thirdRejected', 'fourthRejected') THEN 1 END) as rejected
            ")
            ->first();

        return [
            'pipeline' => [
                ['key' => 'submitted', 'label' => 'Submitted', 'count' => (int) ($counts->submitted ?? 0)],
                ['key' => 'underReview', 'label' => 'Under Review', 'count' => (int) ($counts->under_review ?? 0)],
                ['key' => 'approved', 'label' => 'Approved', 'count' => (int) ($counts->approved ?? 0)],
                ['key' => 'rejected', 'label' => 'Rejected', 'count' => (int) ($counts->rejected ?? 0)],
            ],
        ];
    }

    private function projects(): array
    {
        return [
            'byStatus' => Project::query()
                ->select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->orderBy('status')
                ->get()
                ->map(fn ($item) => [
                    'status' => $item->status,
                    'label' => $this->humanizeStatus($item->status),
                    'count' => (int) $item->count,
                ])
                ->values(),

            'byProvince' => DB::table('project_province')
                ->join('provinces', 'project_province.province_id', '=', 'provinces.id')
                ->join('projects', 'project_province.project_id', '=', 'projects.id')
                ->whereNull('projects.deleted_at')
                ->whereNull('provinces.deleted_at')
                ->select('provinces.name as province', DB::raw('COUNT(DISTINCT project_province.project_id) as count'))
                ->groupBy('provinces.id', 'provinces.name')
                ->orderByDesc('count')
                ->limit(12)
                ->get()
                ->map(fn ($item) => [
                    'province' => $item->province,
                    'count' => (int) $item->count,
                ])
                ->values(),
        ];
    }

    private function queues($user): array
    {
        return [
            'databasesAwaitingReview' => $user->can('Database_submission.view')
                ? $this->queueItems(self::SUBMITTED_STATUSES, 8)
                : [],

            'aprsAwaitingAction' => ($user->can('Apr.review') || $user->can('Apr.validate'))
                ? $this->queueItems(array_merge(self::REVIEW_STATUSES, self::VALIDATION_STATUSES), 8)
                : [],

            'recentSubmissions' => $this->queueItems([
                'submitted',
                'resubmitted',
                'firstApproved',
                'firstRejected',
                'aprGenerated',
                'secondRejected',
                'reviewed',
                'thirdRejected',
                'secondApproved',
                'fourthRejected',
            ], 8),
        ];
    }

    private function notifications($user): array
    {
        $notifications = $user->notifications()
            ->latest('notifications.created_at')
            ->limit(5)
            ->get(['notifications.id', 'title', 'message', 'type', 'notifications.created_at']);

        return [
            'unreadCount' => $user->notifications()
                ->wherePivot('readAt', false)
                ->count(),
            'recent' => $notifications->map(fn ($notification) => [
                'id' => $notification->id,
                'title' => $notification->title,
                'message' => $notification->message,
                'type' => $notification->type,
                'createdAt' => optional($notification->created_at)->toDateTimeString(),
            ])->values(),
        ];
    }

    private function queueItems(array $statuses, int $limit)
    {
        return Apr::query()
            ->with([
                'project:id,projectCode,projectTitle',
                'database:id,name',
                'province:id,name',
                'manager:id,name',
            ])
            ->whereIn('status', $statuses)
            ->latest()
            ->limit($limit)
            ->get(['id', 'project_id', 'database_id', 'province_id', 'manager_id', 'status', 'fromDate', 'toDate', 'created_at'])
            ->map(fn ($apr) => [
                'id' => $apr->id,
                'status' => $apr->status,
                'statusLabel' => $this->humanizeStatus($apr->status),
                'projectCode' => $apr->project?->projectCode,
                'projectTitle' => $apr->project?->projectTitle,
                'database' => $apr->database?->name,
                'province' => $apr->province?->name,
                'manager' => $apr->manager?->name,
                'fromDate' => $apr->fromDate,
                'toDate' => $apr->toDate,
                'createdAt' => optional($apr->created_at)->toDateTimeString(),
            ])
            ->values();
    }

    private function humanizeStatus(?string $status): string
    {
        if (!$status) {
            return 'Unknown';
        }

        $labels = [
            'planed' => 'Planned',
            'ongoing' => 'Ongoing',
            'completed' => 'Completed',
            'onhold' => 'On Hold',
            'canclled' => 'Cancelled',
            'submitted' => 'Submitted',
            'resubmitted' => 'Resubmitted',
            'firstApproved' => 'First Approved',
            'firstRejected' => 'First Rejected',
            'aprGenerated' => 'APR Generated',
            'secondRejected' => 'Second Rejected',
            'reviewed' => 'Reviewed',
            'thirdRejected' => 'Third Rejected',
            'secondApproved' => 'Second Approved',
            'fourthRejected' => 'Fourth Rejected',
        ];

        return $labels[$status] ?? ucfirst(trim(preg_replace('/(?<!^)[A-Z]/', ' $0', $status)));
    }
}
