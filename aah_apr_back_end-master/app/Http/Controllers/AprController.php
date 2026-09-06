<?php

namespace App\Http\Controllers;
use App\Models\Apr;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use App\Events\MessageSent;
use App\Models\AprLog;
use Illuminate\Support\Facades\Auth;
use App\Jobs\GenerateApr;



class AprController extends Controller
{

    public function indexReviewedAprs(Request $request)
    {
        $query = Apr::query()
            ->with(['project', 'province', 'database'])
            ->whereIn('status', ['reviewed', 'secondApproved']);

        $query->when($request->filled('projectCode'), fn($q) =>
            $q->whereIn('project_id', (array) $request->input('projectCode'))
        );

        $query->when($request->filled('database'), fn($q) =>
            $q->whereIn('database_id', (array) $request->input('database'))
        );

        $query->when($request->filled('province'), fn($q) =>
            $q->whereIn('province_id', (array) $request->input('province'))
        );

        $query->when($request->filled('fromDate'), function ($q) use ($request) {
            $dates = explode(',', $request->input('fromDate'));
            $q->whereIn('fromDate', $dates);
        }
        );

        $query->when($request->filled('toDate'), function ($q) use ($request) {
            $dates = explode(',', $request->input('toDate'));
            $q->whereIn('toDate', $dates);
        }
        );

        $query->when($request->input('search'), fn($q) =>
            $q->whereHas('project', function ($q2) use ($request) {
                $codes = explode(',', $request->input('search'));
                $q2->where(function ($q3) use ($codes) {
                    foreach ($codes as $code) {
                        $q3->orWhere("projectCode", "like", "%" . $code . "%"); 
                    }
                });
            }
            )
        );

        $perPage = $request->integer("perPage", 10);
        $order = $request->str("order", "desc");

        $aprs = $query->orderBy("created_at", $order)->paginate($perPage);

        if ($aprs->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No APR was found!",
                "data" => []
            ], 200);
        }

        $aprs->getCollection()->transform(function ($apr) {

            $tempProject = $apr->project;
            $tempProvince = $apr->province;
            $tempDatabase = $apr->database;

            unset($apr->project, $apr->province, $apr->database);
            
            $apr->projectCode = $tempProject?->projectCode;
            $apr->province = $tempProvince?->name;
            $apr->database = $tempDatabase?->name;

            return $apr;
        });

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $aprs
        ]);
    }

    public function indexGeneratedAprs (Request $request) {

        $query = Apr::query()->with(['project', 'database', 'province'])->where("status", "fourthRejected")->orWhere("status", "aprGenerated");

        $query->when($request->filled('projectCode'), fn($q) =>
            $q->whereIn('project_id', (array) $request->input('projectCode'))
        );

        $query->when($request->filled('database'), fn($q) =>
            $q->whereIn('database_id', (array) $request->input('database'))
        );

        $query->when($request->filled('province'), fn($q) =>
            $q->whereIn('province_id', (array) $request->input('province'))
        );

        $query->when($request->filled('fromDate'), function ($q) use ($request) {
            $dates = explode(',', $request->input('fromDate'));
            $q->whereIn('fromDate', $dates);
        }
        );

        $query->when($request->filled('toDate'), function ($q) use ($request) {
            $dates = explode(',', $request->input('toDate'));
            $q->whereIn('toDate', $dates);
        }
        );

        $query->when($request->input('search'), fn($q) =>
            $q->whereHas('project', function ($q) use ($request) {
                $codes = explode(',', $request->input('search'));
                $q->where(function ($q2) use ($codes) {
                    foreach ($codes as $code) {
                        $q2->orWhere('projectCode', $code);
                    }
                });
            }
            )
        );

        $perPage = $request->integer("perPage", 10);
        $order = $request->str("order", "desc");

        $aprs = $query->orderBy("created_at", $order)->paginate($perPage);

        if ($aprs->isEmpty()) return response()->json(["status" => false, "message" => "No apr was found !", "data" => []], 200);

        $aprs->getCollection()->transform(function ($apr) {

            $tempProject = $apr->project;
            $tempProvince = $apr->province;
            $tempDatabase = $apr->database;

            unset($apr->project, $apr->province, $apr->database);
            
            $apr->projectCode = $tempProject?->projectCode;
            $apr->province = $tempProvince?->name;
            $apr->database = $tempDatabase?->name;

            return $apr;
        });

        return response()->json(["status" => true, "message" => "", "data" => $aprs]);
    }
    
    public function generateApr (string $id)
    {

        $apr = Apr::find($id);

        if (!$apr || ($apr->status != "firstApproved" && $apr->status != "thirdRejected")) return response()->json(["status" => false, "message" => "No such database to generat apr !"], 404);

        $apr->status = 'aprGenerated';
        $apr->save();

        AprLog::create([
            "apr_id" => $apr->id,
            "user_id" => Auth::id(),
            "action" => "aprGenerated",
            "comment" => null
        ]);

        GenerateApr::dispatch(
            $apr->project_id,
            $apr->database_id,
            $apr->province_id,
            $apr->fromDate,
            $apr->toDate,
            Auth::id()
        );

        return response()->json(["status" => true, "message" => "Thanks! The system will notify you when the process is done.", "data" => []], 200);

    }

    public function showGeneratedApr (string $id) {

        $apr = Apr::find($id);

        if (!$apr || ($apr->status != "aprGenerated" && $apr->status != "secondApproved" && $apr->status != "fourthRejected" && $apr->status != "reviewed")) return response()->json(["status" => false, "message" => "No such database for reviewing !"], 404);

        $instance = new AprGeneratorController();

        return $instance->showSpicificDatabaseApr($apr->project_id, $apr->database_id, $apr->province_id, $apr->fromDate, $apr->toDate);

    }

    public function getSystemAprsStatus()
    {
        $stats = Apr::selectRaw("
            COUNT(CASE WHEN status IN ('submitted', 'resubmitted') THEN 1 END) as submitted,
            
            COUNT(CASE WHEN status IN ('firstApproved', 'secondApproved') THEN 1 END) as approved,
            
            COUNT(CASE WHEN status IN (
                'firstRejected',
                'secondRejected',
                'thirdRejected',
                'fourthRejected'
            ) THEN 1 END) as rejected,
            
            COUNT(CASE WHEN status = 'reviewed' THEN 1 END) as reviewed
        ")->first();

        return response()->json([
            "status" => true,
            "data" => $stats
        ], 200);
    }

    public function markAprAsReviewed(string $id)
    {
        $apr = Apr::find($id);

        if (!$apr) {
            return response()->json([
                "status" => false,
                "message" => "No APR found in the system.",
            ], 404);
        }

        $responsibleUsersForCommingSteps = User::permission('Apr.validate')->get();

        if ($responsibleUsersForCommingSteps->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "The system cannot proceed because no authorized user is available for the next step.",
            ]);
        }

        $apr->status = 'reviewed';
        $apr->save();

        AprLog::create([
            "apr_id" => $apr->id,
            "user_id" => Auth::id(),
            "action" => "reviewed",
            "comment" => null
        ]);

        $notificationTitle = "APR Reviewed";
        $notificationMessage = "An APR has been reviewed and is awaiting further action.";

        $notification = Notification::create([
            "title"   => $notificationTitle,
            "message" => $notificationMessage,
            "type"    => "submittedDatabase",
            "apr_id"  => $apr->id,
        ]);

        foreach ($responsibleUsersForCommingSteps as $user) {
            $user->notifications()->attach($notification->id, ['readAt' => false]);
            event(new MessageSent($user->id, $notificationMessage));
        }

        return response()->json([
            "status" => true,
            "message" => "APR status successfully changed to Reviewed.",
        ], 200);
    }

    public function rejectAprInReviewStage (string $id)
    {

        $validated = request()->validate([
            "comment" => "nullable|string|max:1000",
        ]);

        $apr = Apr::find($id);

        if (!$apr || ($apr->status != "aprGenerated" && $apr->status != "fourthRejected")) return response()->json(["status" => false, 'No such APR with status "Apr Generated" or "Fourth Rejected" found in the system!'], 404);

        $apr->status = "thirdRejected";
        $apr->save();

        AprLog::create([
            "apr_id" => $apr->id,
            "user_id" => Auth::id(),
            "action" => "thirdRejected",
            "comment" => $validated["comment"] ?? null
        ]);

        $correspondingAprLogInAprGeneratedStage = AprLog::where("action", "aprGenerated")->where("apr_id", $id)->first();

        if (!$correspondingAprLogInAprGeneratedStage)
            return response()->json(["status" => false, "message" => "The system could not find the selected APR log in the first approved stage, so it cannot notify anyone to check it!"]);

        $firstApprover = User::find($correspondingAprLogInAprGeneratedStage->user_id);

        if (!$firstApprover)
            return response()->json(["status" => false, "message" => "The system could not find the person whe has approved the apr in first stage so it can not notify anyone to check it !"]);

        $notification = Notification::create([
            "title"   => "Apr rejected (Review stage)",
            "message" => "The apr that you approved has been rejected by " . (Auth::user()?->name ?? "Unknown User") . ($validated["comment"] ? " with comment: " . $validated["comment"] : "."),
            "type"    => "submittedDatabase",
            "apr_id"  => $apr->id,
        ]);

        $firstApprover->notifications()->attach($notification->id, ["readAt" => false]);
        event(new MessageSent($firstApprover->id, "The apr that you approved has been rejected by " . (Auth::user()?->name ?? "Unknown User") . ($validated["comment"] ? " with comment: " . $validated["comment"] : ".")));

        return response()->json(["status" => true, "message" => "Apr status changed to rejected !"], 200);
    }

    public function approveApr(Request $request, string $id)
    {
        $apr = Apr::find($id);

        if (!$apr) {
            return response()->json([
                "status" => false,
                "message" => "No APR found in the system.",
            ], 404);
        }

        $validated = $request->validate([
            "newStatus" => "required|in:secondApproved,fourthRejected",
            "comment"   => "nullable|string|max:1000",
        ]);

        $validator = User::find(Auth::id());
        $validatorName = $validator ? $validator->name : 'Unknown user';

        // Its because we wanna to notify all users who has Apr.validate permission that a new apr has been compleatly approved (second stage)
        $usersWhoHasTheSamePermissionsAsMe = User::permission('Apr.validate')->get();

        $apr->status = $validated["newStatus"];
        $apr->save();

        AprLog::create([
            "apr_id" => $apr->id,
            "user_id" => Auth::id(),
            "action" => $validated["newStatus"],
            "comment" => $validated["comment"] ?? null
        ]);

        $status = $validated["newStatus"];
        $notificationTitle = $status === "secondApproved" ? "APR Approved (Second Stage)" : "APR Rejected (Second Stage)";
        $notificationMessage = $status === "secondApproved"
            ? "A new APR has been approved by {$validatorName} in the second stage."
            : "The APR you reviewed has been rejected by {$validatorName}" . ($validated["comment"] ? " with comment: " . $validated["comment"] : ".");

        $notification = Notification::create([
            "title"   => $notificationTitle,
            "message" => $notificationMessage,
            "type"    => "submittedDatabase",
            "apr_id"  => $apr->id,
        ]);

        if ($validated["newStatus"] == "secondApproved")
            foreach ($usersWhoHasTheSamePermissionsAsMe as $user) {
                $user->notifications()->attach($notification->id, ['readAt' => false]);
                event(new MessageSent($user->id, $notificationMessage));
            }
        else {

            $correspondingAprLogInReviwedStage = AprLog::where("action", "reviewed")->where("apr_id", $apr->id)->first();

            if (!$correspondingAprLogInReviwedStage)
                return response()->json(["status" => false, "message" => "The system could not find the selected APR log in the reviewed stage, so it cannot notify anyone to check it!"]);

            $reviewer = User::find($correspondingAprLogInReviwedStage->user_id);

            if (!$reviewer)
                return response()->json(["status" => false, "message" => "The system could not find the selected APR reviewer, so it cannot notify anyone to check it !"]);

            $notification = Notification::create([
                "title"   => $notificationTitle,
                "message" => $notificationMessage,
                "type"    => "submittedDatabase",
                "apr_id"  => $apr->id,
            ]);
            
            $reviewer->notifications()->attach($notification->id, ['readAt' => false]);
            event(new MessageSent($reviewer->id, $notificationMessage));

        }
            

        $friendlyStatus = $status === "secondApproved" ? "Second Approved" : "Second Rejected";

        return response()->json([
            "status"  => true,
            "message" => "APR status successfully changed to {$friendlyStatus}.",
        ], 200);
    }

}
