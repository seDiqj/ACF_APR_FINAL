<?php

namespace App\Services;

use App\Models\Apr;
use App\Models\Beneficiary;
use App\Models\CommunityDialogue;
use App\Models\Enact;
use App\Models\Indicator;
use App\Models\Project;
use App\Models\Program;
use App\Models\Province;
use App\Models\Referral;
use App\Models\Training;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getDashboard(array $filters = []): array
    {
        $projectId = $filters['project_id'] ?? null;
        $provinceId = $filters['province_id'] ?? null;
        $databaseId = $filters['database_id'] ?? null;

        $from = !empty($filters['from'])
            ? Carbon::parse($filters['from'])->startOfDay()
            : null;

        $to = !empty($filters['to'])
            ? Carbon::parse($filters['to'])->endOfDay()
            : null;

        return [
            'overview' => $this->overview(
                $projectId,
                $provinceId,
                $databaseId,
                $from,
                $to
            ),

            'projectPerformance' => $this->projectPerformance(
                $projectId,
                $provinceId,
                $databaseId,
                $from,
                $to
            ),

            'indicatorPerformance' => $this->indicatorPerformance(
                $projectId,
                $provinceId,
                $databaseId
            ),

            'beneficiaries' => [
                'gender' => $this->beneficiariesByGender(
                    $projectId,
                    $provinceId,
                    $databaseId,
                    $from,
                    $to
                ),

                'province' => $this->beneficiariesByProvince(
                    $projectId,
                    $provinceId,
                    $databaseId,
                    $from,
                    $to
                ),

                'registrationTrend' => $this->beneficiaryRegistrationTrend(
                    $projectId,
                    $provinceId,
                    $databaseId,
                    $from,
                    $to
                ),
            ],

            'programs' => $this->programStatistics(
                $projectId,
                $provinceId,
                $databaseId,
                $from,
                $to
            ),

            'trainings' => [
                'summary' => $this->trainingSummary(
                    $projectId,
                    $provinceId,
                    $from,
                    $to
                ),

                'modality' => $this->trainingModality(
                    $projectId,
                    $provinceId,
                    $from,
                    $to
                ),

                'participants' => $this->trainingParticipants(
                    $projectId,
                    $provinceId,
                    $from,
                    $to
                ),
            ],

            'communityDialogues' => $this->communityDialogueStatistics(
                $projectId,
                $provinceId,
                $from,
                $to
            ),

            'referrals' => $this->referralStatistics(
                $projectId,
                $provinceId,
                $databaseId,
                $from,
                $to
            ),

            'aprs' => $this->aprStatistics(
                $projectId,
                $provinceId,
                $databaseId,
                $from,
                $to
            ),

            'enacts' => $this->enactStatistics(
                $projectId,
                $provinceId,
                $from,
                $to
            ),

            'activity' => $this->activityTrend(
                $projectId,
                $provinceId,
                $databaseId,
                $from,
                $to
            ),

            'filters' => $this->filterOptions(),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Overview
    |--------------------------------------------------------------------------
    */

    private function overview(
        $projectId,
        $provinceId,
        $databaseId,
        $from,
        $to
    ): array {
        $projects = Project::query()
            ->whereNull('projects.deleted_at');

        if ($projectId) {
            $projects->where('projects.id', $projectId);
        }

        if ($from) {
            $projects->whereDate('projects.startDate', '>=', $from);
        }

        if ($to) {
            $projects->whereDate('projects.startDate', '<=', $to);
        }

        $programs = Program::query()
            ->whereNull('programs.deleted_at');

        $this->applyProgramFilters(
            $programs,
            $projectId,
            $provinceId,
            $databaseId
        );

        $beneficiaries = Beneficiary::query()
            ->whereNull('beneficiaries.deleted_at');

        $this->applyBeneficiaryFilters(
            $beneficiaries,
            $projectId,
            $provinceId,
            $databaseId
        );

        $this->applyDateFilter(
            $beneficiaries,
            'beneficiaries.dateOfRegistration',
            $from,
            $to
        );

        $indicators = Indicator::query()
            ->whereNull('indicators.deleted_at');

        if ($projectId) {
            $indicators
                ->join('outputs', 'outputs.id', '=', 'indicators.output_id')
                ->join('outcomes', 'outcomes.id', '=', 'outputs.outcome_id')
                ->where('outcomes.project_id', $projectId)
                ->whereNull('outputs.deleted_at')
                ->whereNull('outcomes.deleted_at');
        }

        if ($databaseId) {
            $indicators->where('indicators.database_id', $databaseId);
        }

        $trainings = Training::query()
            ->whereNull('trainings.deleted_at');

        if ($projectId) {
            $trainings->where('trainings.project_id', $projectId);
        }

        if ($provinceId) {
            $trainings->where('trainings.province_id', $provinceId);
        }

        $this->applyDateFilter(
            $trainings,
            'trainings.startDate',
            $from,
            $to
        );

        $referrals = Referral::query()
            ->whereNull('referrals.deleted_at');

        $this->applyBeneficiaryFiltersToReferral(
            $referrals,
            $projectId,
            $provinceId,
            $databaseId
        );

        $this->applyDateFilter(
            $referrals,
            'referrals.dateOfReferral',
            $from,
            $to
        );

        $communityDialogues = CommunityDialogue::query()
            ->whereNull('community_dialogues.deleted_at');

        if ($projectId) {
            $communityDialogues
                ->join(
                    'programs',
                    'programs.id',
                    '=',
                    'community_dialogues.program_id'
                )
                ->where('programs.project_id', $projectId)
                ->whereNull('programs.deleted_at');
        }

        if ($provinceId) {
            $communityDialogues
                ->join(
                    'programs as cd_programs',
                    'cd_programs.id',
                    '=',
                    'community_dialogues.program_id'
                )
                ->where(
                    'cd_programs.province_id',
                    $provinceId
                );
        }

        return [
            'projects' => $projects->count(),

            'activeProjects' => (clone $projects)
                ->where('projects.status', 'ongoing')
                ->count(),

            'programs' => $programs->count(),

            'beneficiaries' => $beneficiaries->count(),

            'indicators' => $indicators->distinct('indicators.id')->count(
                'indicators.id'
            ),

            'trainings' => $trainings->count(),

            'referrals' => $referrals->count(),

            'communityDialogues' => $communityDialogues
                ->distinct('community_dialogues.id')
                ->count('community_dialogues.id'),

            'enacts' => $this->filteredEnacts(
                $projectId,
                $provinceId,
                $from,
                $to
            )->count(),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Project Performance
    |--------------------------------------------------------------------------
    */

    private function projectPerformance(
        $projectId,
        $provinceId,
        $databaseId,
        $from,
        $to
    ): array {
        $query = Project::query()
            ->select([
                'projects.id',
                'projects.projectCode',
                'projects.projectTitle',
                'projects.status',
                'projects.startDate',
                'projects.endDate',
            ])
            ->whereNull('projects.deleted_at');

        if ($projectId) {
            $query->where('projects.id', $projectId);
        }

        if ($from) {
            $query->whereDate('projects.startDate', '>=', $from);
        }

        if ($to) {
            $query->whereDate('projects.startDate', '<=', $to);
        }

        $projects = $query
            ->withCount([
                'programs as programs_count',
                'outcomes as outcomes_count',
                'aprs as aprs_count',
                'trainings as trainings_count',
                'enacts as enacts_count',
            ])
            ->get();

        return $projects->map(function ($project) use (
            $provinceId,
            $databaseId
        ) {
            $indicatorQuery = Indicator::query()
                ->join(
                    'outputs',
                    'outputs.id',
                    '=',
                    'indicators.output_id'
                )
                ->join(
                    'outcomes',
                    'outcomes.id',
                    '=',
                    'outputs.outcome_id'
                )
                ->where(
                    'outcomes.project_id',
                    $project->id
                )
                ->whereNull('indicators.deleted_at')
                ->whereNull('outputs.deleted_at')
                ->whereNull('outcomes.deleted_at');

            if ($databaseId) {
                $indicatorQuery->where(
                    'indicators.database_id',
                    $databaseId
                );
            }

            $target = (int) $indicatorQuery->sum('indicators.target');

            $achieved = (int) $indicatorQuery->sum(
                'indicators.achived_target'
            );

            $percentage = $target > 0
                ? round(($achieved / $target) * 100, 1)
                : 0;

            return [
                'id' => $project->id,
                'code' => $project->projectCode,
                'title' => $project->projectTitle,
                'status' => $project->status,
                'startDate' => $project->startDate,
                'endDate' => $project->endDate,
                'programs' => $project->programs_count,
                'outcomes' => $project->outcomes_count,
                'aprs' => $project->aprs_count,
                'trainings' => $project->trainings_count,
                'enacts' => $project->enacts_count,
                'target' => $target,
                'achieved' => $achieved,
                'percentage' => $percentage,
            ];
        })->values()->toArray();
    }

    /*
    |--------------------------------------------------------------------------
    | Indicator Performance
    |--------------------------------------------------------------------------
    */

    private function indicatorPerformance(
        $projectId,
        $provinceId,
        $databaseId
    ): array {
        $query = Indicator::query()
            ->select([
                'indicators.id',
                'indicators.indicator',
                'indicators.indicatorRef',
                'indicators.target',
                'indicators.achived_target',
                'indicators.status',
                'indicators.database_id',
                'outputs.output',
                'outputs.outputRef',
                'outcomes.outcome',
                'outcomes.outcomeRef',
                'projects.id as project_id',
                'projects.projectTitle',
            ])
            ->join(
                'outputs',
                'outputs.id',
                '=',
                'indicators.output_id'
            )
            ->join(
                'outcomes',
                'outcomes.id',
                '=',
                'outputs.outcome_id'
            )
            ->join(
                'projects',
                'projects.id',
                '=',
                'outcomes.project_id'
            )
            ->whereNull('indicators.deleted_at')
            ->whereNull('outputs.deleted_at')
            ->whereNull('outcomes.deleted_at')
            ->whereNull('projects.deleted_at');

        if ($projectId) {
            $query->where('projects.id', $projectId);
        }

        if ($databaseId) {
            $query->where(
                'indicators.database_id',
                $databaseId
            );
        }

        return $query
            ->orderByDesc('indicators.target')
            ->limit(50)
            ->get()
            ->map(function ($indicator) {
                $target = (int) $indicator->target;
                $achieved = (int) $indicator->achived_target;

                return [
                    'id' => $indicator->id,
                    'indicator' => $indicator->indicator,
                    'indicatorRef' => $indicator->indicatorRef,
                    'project' => $indicator->projectTitle,
                    'projectId' => $indicator->project_id,
                    'outcome' => $indicator->outcome,
                    'outcomeRef' => $indicator->outcomeRef,
                    'output' => $indicator->output,
                    'outputRef' => $indicator->outputRef,
                    'target' => $target,
                    'achieved' => $achieved,
                    'status' => $indicator->status,
                    'percentage' => $target > 0
                        ? round(($achieved / $target) * 100, 1)
                        : 0,
                ];
            })
            ->toArray();
    }

    /*
    |--------------------------------------------------------------------------
    | Beneficiaries
    |--------------------------------------------------------------------------
    */

    private function beneficiariesByGender(
        $projectId,
        $provinceId,
        $databaseId,
        $from,
        $to
    ): array {
        $query = Beneficiary::query()
            ->select(
                'beneficiaries.gender',
                DB::raw('COUNT(DISTINCT beneficiaries.id) as total')
            )
            ->whereNull('beneficiaries.deleted_at');

        $this->applyBeneficiaryFilters(
            $query,
            $projectId,
            $provinceId,
            $databaseId
        );

        $this->applyDateFilter(
            $query,
            'beneficiaries.dateOfRegistration',
            $from,
            $to
        );

        return $query
            ->groupBy('beneficiaries.gender')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($item) => [
                'name' => ucfirst($item->gender),
                'value' => (int) $item->total,
            ])
            ->toArray();
    }

    private function beneficiariesByProvince(
        $projectId,
        $provinceId,
        $databaseId,
        $from,
        $to
    ): array {
        $query = DB::table('database_program_beneficiary')
            ->join(
                'beneficiaries',
                'beneficiaries.id',
                '=',
                'database_program_beneficiary.beneficiary_id'
            )
            ->join(
                'programs',
                'programs.id',
                '=',
                'database_program_beneficiary.program_id'
            )
            ->join(
                'provinces',
                'provinces.id',
                '=',
                'programs.province_id'
            )
            ->whereNull('beneficiaries.deleted_at')
            ->whereNull('programs.deleted_at')
            ->whereNull('provinces.deleted_at')
            ->select([
                'provinces.id',
                'provinces.name',
                DB::raw(
                    'COUNT(DISTINCT beneficiaries.id) as total'
                ),
            ]);

        if ($projectId) {
            $query->where(
                'programs.project_id',
                $projectId
            );
        }

        if ($provinceId) {
            $query->where(
                'programs.province_id',
                $provinceId
            );
        }

        if ($databaseId) {
            $query->where(
                'database_program_beneficiary.database_id',
                $databaseId
            );
        }

        if ($from) {
            $query->whereDate(
                'beneficiaries.dateOfRegistration',
                '>=',
                $from
            );
        }

        if ($to) {
            $query->whereDate(
                'beneficiaries.dateOfRegistration',
                '<=',
                $to
            );
        }

        return $query
            ->groupBy('provinces.id', 'provinces.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'value' => (int) $item->total,
            ])
            ->toArray();
    }

    private function beneficiaryRegistrationTrend(
        $projectId,
        $provinceId,
        $databaseId,
        $from,
        $to
    ): array {
        $query = Beneficiary::query()
            ->selectRaw(
                "DATE_FORMAT(dateOfRegistration, '%Y-%m') as month,
                 COUNT(*) as total"
            )
            ->whereNull('beneficiaries.deleted_at')
            ->whereNotNull('dateOfRegistration');

        $this->applyBeneficiaryFilters(
            $query,
            $projectId,
            $provinceId,
            $databaseId
        );

        $this->applyDateFilter(
            $query,
            'beneficiaries.dateOfRegistration',
            $from,
            $to
        );

        return $query
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($item) => [
                'month' => $item->month,
                'total' => (int) $item->total,
            ])
            ->toArray();
    }

    /*
    |--------------------------------------------------------------------------
    | Programs
    |--------------------------------------------------------------------------
    */

    private function programStatistics(
        $projectId,
        $provinceId,
        $databaseId,
        $from,
        $to
    ): array {
        $query = Program::query()
            ->select([
                'programs.id',
                'programs.name',
                'programs.project_id',
                'programs.province_id',
            ])
            ->whereNull('programs.deleted_at');

        $this->applyProgramFilters(
            $query,
            $projectId,
            $provinceId,
            $databaseId
        );

        $programs = $query
            ->withCount([
                'beneficiaries as beneficiaries_count',
                'communityDialogues as dialogues_count',
            ])
            ->orderByDesc('beneficiaries_count')
            ->limit(20)
            ->get();

        return $programs->map(fn ($program) => [
            'id' => $program->id,
            'name' => $program->name,
            'beneficiaries' => $program->beneficiaries_count,
            'dialogues' => $program->dialogues_count,
        ])->toArray();
    }

    /*
    |--------------------------------------------------------------------------
    | Trainings
    |--------------------------------------------------------------------------
    */

    private function trainingSummary(
        $projectId,
        $provinceId,
        $from,
        $to
    ): array {
        $query = Training::query()
            ->select([
                'trainings.id',
                'trainings.name',
                'trainings.startDate',
                'trainings.endDate',
                'trainings.trainingModality',
                'trainings.participantCatagory',
            ])
            ->whereNull('trainings.deleted_at');

        if ($projectId) {
            $query->where(
                'trainings.project_id',
                $projectId
            );
        }

        if ($provinceId) {
            $query->where(
                'trainings.province_id',
                $provinceId
            );
        }

        $this->applyDateFilter(
            $query,
            'trainings.startDate',
            $from,
            $to
        );

        return $query
            ->withCount([
                'beneficiaries as participants'
            ])
            ->orderByDesc('trainings.startDate')
            ->limit(20)
            ->get()
            ->map(fn ($training) => [
                'id' => $training->id,
                'name' => $training->name,
                'startDate' => $training->startDate,
                'endDate' => $training->endDate,
                'modality' => $training->trainingModality,
                'category' => $training->participantCatagory,
                'participants' => $training->participants,
            ])
            ->toArray();
    }

    private function trainingModality(
        $projectId,
        $provinceId,
        $from,
        $to
    ): array {
        $query = Training::query()
            ->select(
                'trainingModality',
                DB::raw('COUNT(*) as total')
            )
            ->whereNull('trainings.deleted_at');

        if ($projectId) {
            $query->where(
                'trainings.project_id',
                $projectId
            );
        }

        if ($provinceId) {
            $query->where(
                'trainings.province_id',
                $provinceId
            );
        }

        $this->applyDateFilter(
            $query,
            'trainings.startDate',
            $from,
            $to
        );

        return $query
            ->groupBy('trainingModality')
            ->get()
            ->map(fn ($item) => [
                'name' => $item->trainingModality,
                'value' => (int) $item->total,
            ])
            ->toArray();
    }

    private function trainingParticipants(
        $projectId,
        $provinceId,
        $from,
        $to
    ): array {
        $query = DB::table('trainings')
            ->join(
                'beneficiary_training',
                'beneficiary_training.training_id',
                '=',
                'trainings.id'
            )
            ->join(
                'beneficiaries',
                'beneficiaries.id',
                '=',
                'beneficiary_training.beneficiary_id'
            )
            ->whereNull('trainings.deleted_at')
            ->whereNull('beneficiaries.deleted_at')
            ->selectRaw(
                "DATE_FORMAT(trainings.startDate, '%Y-%m') as month,
                 COUNT(DISTINCT beneficiary_training.beneficiary_id) as total"
            );

        if ($projectId) {
            $query->where(
                'trainings.project_id',
                $projectId
            );
        }

        if ($provinceId) {
            $query->where(
                'trainings.province_id',
                $provinceId
            );
        }

        if ($from) {
            $query->whereDate(
                'trainings.startDate',
                '>=',
                $from
            );
        }

        if ($to) {
            $query->whereDate(
                'trainings.startDate',
                '<=',
                $to
            );
        }

        return $query
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($item) => [
                'month' => $item->month,
                'total' => (int) $item->total,
            ])
            ->toArray();
    }

    /*
    |--------------------------------------------------------------------------
    | Community Dialogues
    |--------------------------------------------------------------------------
    */

    private function communityDialogueStatistics(
        $projectId,
        $provinceId,
        $from,
        $to
    ): array {
        $query = DB::table('community_dialogue_sessions')
            ->join(
                'community_dialogues',
                'community_dialogues.id',
                '=',
                'community_dialogue_sessions.community_dialogue_id'
            )
            ->join(
                'programs',
                'programs.id',
                '=',
                'community_dialogues.program_id'
            )
            ->whereNull(
                'community_dialogues.deleted_at'
            )
            ->whereNull(
                'community_dialogue_sessions.deleted_at'
            )
            ->whereNull('programs.deleted_at')
            ->select([
                'community_dialogue_sessions.type',
                DB::raw(
                    'COUNT(community_dialogue_sessions.id) as total'
                ),
            ]);

        if ($projectId) {
            $query->where(
                'programs.project_id',
                $projectId
            );
        }

        if ($provinceId) {
            $query->where(
                'programs.province_id',
                $provinceId
            );
        }

        if ($from) {
            $query->whereDate(
                'community_dialogue_sessions.date',
                '>=',
                $from
            );
        }

        if ($to) {
            $query->whereDate(
                'community_dialogue_sessions.date',
                '<=',
                $to
            );
        }

        return $query
            ->groupBy('community_dialogue_sessions.type')
            ->get()
            ->map(fn ($item) => [
                'name' => $item->type,
                'value' => (int) $item->total,
            ])
            ->toArray();
    }

    /*
    |--------------------------------------------------------------------------
    | Referrals
    |--------------------------------------------------------------------------
    */

    private function referralStatistics(
        $projectId,
        $provinceId,
        $databaseId,
        $from,
        $to
    ): array {
        $query = Referral::query()
            ->whereNull('referrals.deleted_at');

        $this->applyBeneficiaryFiltersToReferral(
            $query,
            $projectId,
            $provinceId,
            $databaseId
        );

        $this->applyDateFilter(
            $query,
            'referrals.dateOfReferral',
            $from,
            $to
        );

        return [
            'total' => (clone $query)->count(),

            'accepted' => (clone $query)
                ->where('referralAccepted', true)
                ->count(),

            'rejected' => (clone $query)
                ->where('referralAccepted', false)
                ->count(),

            'needsReferral' => (clone $query)
                ->where('needReferral', true)
                ->count(),

            'internal' => (clone $query)
                ->where('type', 'internal')
                ->count(),

            'external' => (clone $query)
                ->where('type', 'external')
                ->count(),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | APR
    |--------------------------------------------------------------------------
    */

    private function aprStatistics(
        $projectId,
        $provinceId,
        $databaseId,
        $from,
        $to
    ): array {
        $query = Apr::query()
            ->whereNull('aprs.deleted_at');

        if ($projectId) {
            $query->where(
                'aprs.project_id',
                $projectId
            );
        }

        if ($provinceId) {
            $query->where(
                'aprs.province_id',
                $provinceId
            );
        }

        if ($databaseId) {
            $query->where(
                'aprs.database_id',
                $databaseId
            );
        }

        if ($from) {
            $query->whereDate(
                'aprs.fromDate',
                '>=',
                $from
            );
        }

        if ($to) {
            $query->whereDate(
                'aprs.toDate',
                '<=',
                $to
            );
        }

        $byStatus = (clone $query)
            ->select(
                'status',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('status')
            ->get()
            ->map(fn ($item) => [
                'name' => $item->status,
                'value' => (int) $item->total,
            ])
            ->toArray();

        return [
            'total' => $query->count(),
            'byStatus' => $byStatus,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Enacts
    |--------------------------------------------------------------------------
    */

    private function filteredEnacts(
        $projectId,
        $provinceId,
        $from,
        $to
    ) {
        $query = Enact::query()
            ->whereNull('enacts.deleted_at');

        if ($projectId) {
            $query->where(
                'enacts.project_id',
                $projectId
            );
        }

        if ($provinceId) {
            $query->where(
                'enacts.province_id',
                $provinceId
            );
        }

        $this->applyDateFilter(
            $query,
            'enacts.date',
            $from,
            $to
        );

        return $query;
    }

    private function enactStatistics(
        $projectId,
        $provinceId,
        $from,
        $to
    ): array {
        $query = $this->filteredEnacts(
            $projectId,
            $provinceId,
            $from,
            $to
        );

        return [
            'total' => (clone $query)->count(),

            'aprIncluded' => (clone $query)
                ->where('aprIncluded', true)
                ->count(),

            'notAprIncluded' => (clone $query)
                ->where('aprIncluded', false)
                ->count(),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Activity Trend
    |--------------------------------------------------------------------------
    */

    private function activityTrend(
        $projectId,
        $provinceId,
        $databaseId,
        $from,
        $to
    ): array {
        $months = collect();

        $start = $from
            ? Carbon::parse($from)->startOfMonth()
            : now()->subMonths(11)->startOfMonth();

        $end = $to
            ? Carbon::parse($to)->startOfMonth()
            : now()->startOfMonth();

        while ($start <= $end) {
            $months->push([
                'month' => $start->format('Y-m'),
                'beneficiaries' => 0,
                'trainings' => 0,
                'referrals' => 0,
                'enacts' => 0,
                'dialogueSessions' => 0,
            ]);

            $start->addMonth();
        }

        $beneficiaries = Beneficiary::query()
            ->selectRaw(
                "DATE_FORMAT(dateOfRegistration, '%Y-%m') as month,
                 COUNT(*) as total"
            )
            ->whereNull('deleted_at')
            ->whereNotNull('dateOfRegistration');

        $this->applyBeneficiaryFilters(
            $beneficiaries,
            $projectId,
            $provinceId,
            $databaseId
        );

        $this->applyDateFilter(
            $beneficiaries,
            'dateOfRegistration',
            $from,
            $to
        );

        $beneficiaries = $beneficiaries
            ->groupBy('month')
            ->pluck('total', 'month');

        $trainings = Training::query()
            ->selectRaw(
                "DATE_FORMAT(startDate, '%Y-%m') as month,
                 COUNT(*) as total"
            )
            ->whereNull('deleted_at');

        if ($projectId) {
            $trainings->where('project_id', $projectId);
        }

        if ($provinceId) {
            $trainings->where('province_id', $provinceId);
        }

        $this->applyDateFilter(
            $trainings,
            'startDate',
            $from,
            $to
        );

        $trainings = $trainings
            ->groupBy('month')
            ->pluck('total', 'month');

        $referrals = Referral::query()
            ->selectRaw(
                "DATE_FORMAT(dateOfReferral, '%Y-%m') as month,
                 COUNT(*) as total"
            )
            ->whereNull('deleted_at')
            ->whereNotNull('dateOfReferral');

        $this->applyBeneficiaryFiltersToReferral(
            $referrals,
            $projectId,
            $provinceId,
            $databaseId
        );

        $this->applyDateFilter(
            $referrals,
            'dateOfReferral',
            $from,
            $to
        );

        $referrals = $referrals
            ->groupBy('month')
            ->pluck('total', 'month');

        $enacts = $this->filteredEnacts(
            $projectId,
            $provinceId,
            $from,
            $to
        )
            ->selectRaw(
                "DATE_FORMAT(date, '%Y-%m') as month,
                 COUNT(*) as total"
            )
            ->groupBy('month')
            ->pluck('total', 'month');

        $dialogues = DB::table(
            'community_dialogue_sessions'
        )
            ->join(
                'community_dialogues',
                'community_dialogues.id',
                '=',
                'community_dialogue_sessions.community_dialogue_id'
            )
            ->join(
                'programs',
                'programs.id',
                '=',
                'community_dialogues.program_id'
            )
            ->whereNull(
                'community_dialogue_sessions.deleted_at'
            )
            ->whereNull(
                'community_dialogues.deleted_at'
            )
            ->whereNull('programs.deleted_at')
            ->selectRaw(
                "DATE_FORMAT(community_dialogue_sessions.date, '%Y-%m') as month,
                 COUNT(*) as total"
            );

        if ($projectId) {
            $dialogues->where(
                'programs.project_id',
                $projectId
            );
        }

        if ($provinceId) {
            $dialogues->where(
                'programs.province_id',
                $provinceId
            );
        }

        if ($from) {
            $dialogues->whereDate(
                'community_dialogue_sessions.date',
                '>=',
                $from
            );
        }

        if ($to) {
            $dialogues->whereDate(
                'community_dialogue_sessions.date',
                '<=',
                $to
            );
        }

        $dialogues = $dialogues
            ->groupBy('month')
            ->pluck('total', 'month');

        return $months
            ->map(function ($month) use (
                $beneficiaries,
                $trainings,
                $referrals,
                $enacts,
                $dialogues
            ) {
                $key = $month['month'];

                return [
                    'month' => $key,
                    'beneficiaries' => (int) (
                        $beneficiaries[$key] ?? 0
                    ),
                    'trainings' => (int) (
                        $trainings[$key] ?? 0
                    ),
                    'referrals' => (int) (
                        $referrals[$key] ?? 0
                    ),
                    'enacts' => (int) (
                        $enacts[$key] ?? 0
                    ),
                    'dialogueSessions' => (int) (
                        $dialogues[$key] ?? 0
                    ),
                ];
            })
            ->values()
            ->toArray();
    }

    /*
    |--------------------------------------------------------------------------
    | Filters
    |--------------------------------------------------------------------------
    */

    private function filterOptions(): array
    {
        return [
            'projects' => Project::query()
                ->select('id', 'projectCode', 'projectTitle')
                ->whereNull('deleted_at')
                ->orderBy('projectTitle')
                ->get()
                ->map(fn ($item) => [
                    'id' => $item->id,
                    'label' => $item->projectCode
                        . ' - '
                        . $item->projectTitle,
                ])
                ->values(),

            'provinces' => Province::query()
                ->select('id', 'name')
                ->whereNull('deleted_at')
                ->orderBy('name')
                ->get()
                ->map(fn ($item) => [
                    'id' => $item->id,
                    'label' => $item->name,
                ])
                ->values(),

            'databases' => DB::table('databases')
                ->select('id', 'name')
                ->whereNull('deleted_at')
                ->orderBy('name')
                ->get()
                ->map(fn ($item) => [
                    'id' => $item->id,
                    'label' => $item->name,
                ])
                ->values(),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Filter Helpers
    |--------------------------------------------------------------------------
    */

    private function applyProgramFilters(
        Builder $query,
        $projectId,
        $provinceId,
        $databaseId
    ): void {
        if ($projectId) {
            $query->where(
                'programs.project_id',
                $projectId
            );
        }

        if ($provinceId) {
            $query->where(
                'programs.province_id',
                $provinceId
            );
        }

        if ($databaseId) {
            $query->where(
                'programs.database_id',
                $databaseId
            );
        }
    }

    private function applyBeneficiaryFilters(
        Builder $query,
        $projectId,
        $provinceId,
        $databaseId
    ): void {
        if (!$projectId && !$provinceId && !$databaseId) {
            return;
        }

        $query->whereExists(function ($sub) use (
            $projectId,
            $provinceId,
            $databaseId
        ) {
            $sub->select(DB::raw(1))
                ->from('database_program_beneficiary as dpb')
                ->join(
                    'programs',
                    'programs.id',
                    '=',
                    'dpb.program_id'
                )
                ->whereColumn(
                    'dpb.beneficiary_id',
                    'beneficiaries.id'
                );

            if ($projectId) {
                $sub->where(
                    'programs.project_id',
                    $projectId
                );
            }

            if ($provinceId) {
                $sub->where(
                    'programs.province_id',
                    $provinceId
                );
            }

            if ($databaseId) {
                $sub->where(
                    'dpb.database_id',
                    $databaseId
                );
            }

            $sub->whereNull('programs.deleted_at');
        });
    }

    private function applyBeneficiaryFiltersToReferral(
        Builder $query,
        $projectId,
        $provinceId,
        $databaseId
    ): void {
        if (!$projectId && !$provinceId && !$databaseId) {
            return;
        }

        $query->whereExists(function ($sub) use (
            $projectId,
            $provinceId,
            $databaseId
        ) {
            $sub->select(DB::raw(1))
                ->from('database_program_beneficiary as dpb')
                ->join(
                    'programs',
                    'programs.id',
                    '=',
                    'dpb.program_id'
                )
                ->whereColumn(
                    'dpb.beneficiary_id',
                    'referrals.beneficiary_id'
                );

            if ($projectId) {
                $sub->where(
                    'programs.project_id',
                    $projectId
                );
            }

            if ($provinceId) {
                $sub->where(
                    'programs.province_id',
                    $provinceId
                );
            }

            if ($databaseId) {
                $sub->where(
                    'dpb.database_id',
                    $databaseId
                );
            }

            $sub->whereNull('programs.deleted_at');
        });
    }

    private function applyDateFilter(
        Builder $query,
        string $column,
        $from,
        $to
    ): void {
        if ($from) {
            $query->whereDate(
                $column,
                '>=',
                $from
            );
        }

        if ($to) {
            $query->whereDate(
                $column,
                '<=',
                $to
            );
        }
    }
}