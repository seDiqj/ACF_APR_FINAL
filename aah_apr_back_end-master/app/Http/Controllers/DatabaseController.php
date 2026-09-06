<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNewAprRequest;
use App\Http\Requests\UpdateAprRequest;
use App\Models\Apr;
use App\Models\AprLog;
use App\Models\Database;
use App\Models\Enact;
use App\Models\Notification;
use App\Models\Project;
use App\Models\Program;
use App\Models\Province;
use App\Models\Psychoeducations;
use App\Models\User;
use App\Traits\AprToolsTrait;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DatabaseController extends Controller
{
    use AprToolsTrait;

    public function indexSubmittedAndReSubmittedDatabasesAndFirstRejectedDatabases(Request $request)
    {
        $query = Apr::query()
            ->with(['project', 'database', 'province'])
            ->whereIn('status', ['submitted', "resubmitted", 'firstRejected', 'secondRejected']);


        $query->when($request->filled('projectCode'), function ($q) use ($request) {
            $q->whereIn('project_id', $request->input('projectCode'));
        });

        $query->when($request->filled('database'), fn($q) =>
            $q->whereIn('database_id', $request->input('database'))
        );

        $query->when($request->filled('province'), fn($q) =>
            $q->whereIn('province_id', $request->input('province'))
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

        if (request("search")) {
            $query->whereHas("project", function ($q) use ($request) {
                $codes = $request->input('project');
                $q->whereIn('projectCode', $codes);
            });
        }

        $perPage = $request->integer("perPage", 10);
        $order = $request->input("order", "desc");

        $aprs = $query->orderBy("created_at", $order)->paginate($perPage);

        if ($aprs->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No submitted databases found !",
                "data" => []
            ], 200);
        }

        $aprs->getCollection()->transform(function ($submittedDatabase) {

            $tempProject = $submittedDatabase->project;
            $tempProvince = $submittedDatabase->province;
            $tempDatabase = $submittedDatabase->database;

            unset($submittedDatabase->project, $submittedDatabase->province, $submittedDatabase->database);

            $submittedDatabase->projectCode = $tempProject?->projectCode;
            $submittedDatabase->province = $tempProvince?->name;
            $submittedDatabase->database = $tempDatabase?->name;

            return $submittedDatabase;
        });

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $aprs
        ]);
    }

    public function indexFirstApprovedAndSecondRejectedDatabases(Request $request)
    {
        $query = Apr::query()
            ->with(['project', 'database', 'province'])
            ->whereIn('status', ['firstApproved', 'secondRejected']);

        $query->when($request->filled('projectCode'), fn($q) =>
            $q->whereIn('project_id', $request->input('projectCode'))
        );

        $query->when($request->filled('database'), fn($q) =>
            $q->whereIn('database_id', $request->input('database'))
        );

        $query->when($request->filled('province'), fn($q) =>
            $q->whereIn('province_id', $request->input('province'))
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

        $query->when($search = $request->input('search'), fn($q) =>
            $q->whereHas('project', function ($q) use ($request) {
                $codes = explode(',', $request->input('search'));
                $q->where(function ($q2) use ($codes) {
                    foreach ($codes as $code) {
                        $q2->orWhere("projectCode", $code);
                    }
                });
            }
            )
        );

        $perPage = $request->integer("perPage", 10);
        $order = $request->str("order", "des");

        $databases = $query->orderBy("created_at", $order)->paginate($perPage);

        if ($databases->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No database was found!",
                "data" => []
            ], 200);
        }

        $databases->getCollection()->transform(function ($database) {

            $tempProject = $database->project;
            $tempProvince = $database->province;
            $tempDatabase = $database->database;

            unset($database->project, $database->province, $database->database);

            $database->projectCode = $tempProject?->projectCode;
            $database->province = $tempProvince?->name;
            $database->database = $tempDatabase?->name;

            return $database;
        });

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $databases
        ], 200);
    }

    public function indexFirstApprovedDatabases ()
    {
        $approvedDatabases = Apr::where("status", "firstApproved")->orWhere("status", "thirdRejected")->orderBy("created_at", "desc")->paginate(10);

        if ($approvedDatabases->isEmpty()) return response()->json(["status" => false, "message" => 'No database was found in the "First Approved" stage!', "data" => []], 200);

        $approvedDatabases->map(function ($approvedDatabase) {

            $approvedDatabase["projectCode"] = Project::find($approvedDatabase["project_id"])->projectCode;
            $approvedDatabase["province"] = Province::find($approvedDatabase["province_id"])->name;
            $approvedDatabase["database"] = Database::find($approvedDatabase["database_id"])->name;

            unset($approvedDatabase["project_id"], $approvedDatabase["database_id"], $approvedDatabase["province_id"]);

            return $approvedDatabase;

        });

        return response()->json(["status" => true, "message" => "", "data" => $approvedDatabases]);
    }

    public function showSubmittedDatabase(string $id)
    {
        $submittedDatabase = Apr::find($id);

        if (!$submittedDatabase) {
            return response()->json([
                'status'  => false,
                'message' => 'No such submitted database found in the system!',
                'data'    => null,
            ], 404);
        }

        $project  = Project::find($submittedDatabase->project_id);
        $database = Database::find($submittedDatabase->database_id);
        $province = Province::find($submittedDatabase->province_id);

        abort_if(!$project, 404, 'Invalid project for selected database!');
        abort_if(!$database, 404, 'Invalid database for selected database!');
        abort_if(!$province, 404, 'Invalid province for selected database!');

        $finalData = [
            'project' => [
                'id' => $project->id,
                'projectCode' => $project->projectCode,
            ],
            'database' => $database->name,
            'province' => $province->name,

            'numOfIndicators' => $this->projectIndicatorsToASpicificDatabase($project, $database->id)
                ->count(),

            'numOfOutputs' => $this
                ->projectOutputsToASpicificDatabase($project, $database->id)
                ->count(),

            'numOfOutcomes' => $this
                ->projectOutcomesToASpicificDatabase($project, $database->id)
                ->count(),

            'beneficiaries' => $this
                ->projectBeneficiariesToASpicificDatabaseAndSpicificProvince(
                    $project,
                    $database->id,
                    $province->id
                ),

            'numOfBeneficiaries' => $this
                ->projectBeneficiariesToASpicificDatabaseAndSpicificProvince(
                    $project,
                    $database->id,
                    $province->id
                )->count(),

            'program' => optional(Program::where("project_id", $project->id)
                ->where("province_id", $province->id)
                ->where("database_id", $database->id)
                ->first())->only("id", "name"),

            'status' => $submittedDatabase->status,

            'submittedBy' => optional(
                AprLog::where("apr_id", $submittedDatabase->id)
                    ->whereIn("action", ["submitted", "resubmitted"])
                    ->first()?->user
            )->name,

            'fromDate' => $submittedDatabase->fromDate,
            'toDate'   => $submittedDatabase->toDate,
        ];

        if ($database->name == "psychoeducation_database") {

            $ofMenHostCommunity = 0;
            $ofMenIdp = 0;
            $ofMenRefugee = 0;
            $ofMenReturnee = 0;

            $ofWomenHostCommunity = 0;
            $ofWomenIdp = 0;
            $ofWomenRefugee = 0;
            $ofWomenReturnee = 0;

            $ofBoyHostCommunity = 0;
            $ofBoyIdp = 0;
            $ofBoyRefugee = 0;
            $ofBoyReturnee = 0;

            $ofGirlHostCommunity = 0;
            $ofGirlIdp = 0;
            $ofGirlRefugee = 0;
            $ofGirlReturnee = 0;

            $psychoeducations = Psychoeducations::whereHas("program", function ($q) use ($project, $province) {
                $q->where("project_id", $project->id)
                ->where("province_id", $province->id);
            })->where("awarenessDate", ">=", $submittedDatabase->fromDate)
            ->where("awarenessDate", "<=", $submittedDatabase->toDate)
            ->get();

            foreach ($psychoeducations as $p) {

                $ofMenHostCommunity += $p->ofMenHostCommunity;
                $ofMenIdp += $p->ofMenIdp;
                $ofMenRefugee += $p->ofMenRefugee;
                $ofMenReturnee += $p->ofMenReturnee;

                // women
                $ofWomenHostCommunity += $p->ofWomenHostCommunity;
                $ofWomenIdp += $p->ofWomenIdp;
                $ofWomenRefugee += $p->ofWomenRefugee;
                $ofWomenReturnee += $p->ofWomenReturnee;

                // boy
                $ofBoyHostCommunity += $p->ofBoyHostCommunity;
                $ofBoyIdp += $p->ofBoyIdp;
                $ofBoyRefugee += $p->ofBoyRefugee;
                $ofBoyReturnee += $p->ofBoyReturnee;

                // girl
                $ofGirlHostCommunity += $p->ofGirlHostCommunity;
                $ofGirlIdp += $p->ofGirlIdp;
                $ofGirlRefugee += $p->ofGirlRefugee;
                $ofGirlReturnee += $p->ofGirlReturnee;

            }

            $finalData["ofMenHostCommunity"] = $ofMenHostCommunity;
            $finalData["ofMenIdp"] = $ofMenIdp;
            $finalData["ofMenRefugee"] = $ofMenRefugee;
            $finalData["ofMenReturnee"] = $ofMenReturnee;
            $finalData["ofWomenHostCommunity"] = $ofWomenHostCommunity;
            $finalData["ofWomenIdp"] = $ofWomenIdp;
            $finalData["ofWomenRefugee"] = $ofWomenRefugee;
            $finalData["ofWomenReturnee"] = $ofWomenReturnee;
            $finalData["ofBoyHostCommunity"] = $ofBoyHostCommunity;
            $finalData["ofBoyIdp"] = $ofBoyIdp;
            $finalData["ofBoyRefugee"] = $ofBoyRefugee;
            $finalData["ofBoyReturnee"] = $ofBoyReturnee;
            $finalData["ofGirlHostCommunity"] = $ofGirlHostCommunity;
            $finalData["ofGirlIdp"] = $ofGirlIdp;
            $finalData["ofGirlRefugee"] = $ofGirlRefugee;
            $finalData["ofGirlReturnee"] = $ofGirlReturnee;
        }

        if ($database->name == "enact_database") {

            $enacts = Enact::where("project_id", $project->id)
                ->where("province_id", $province->id)
                ->withCount("assessments")
                ->with("indicator")
                ->get();

            $finalData["numOfEnacts"] = $enacts->count();
            $finalData["numOfAssessments"] = $enacts->sum("assessments_count");
            $finalData["enacts"] = $enacts->map(fn ($enact) => [
                "id" => $enact->id,
                "date" => $enact->date,
                "councilorName" => $enact->councilorName,
                "indicatorRef" => $enact->indicator?->indicatorRef,
                "assessmentsCount" => $enact->assessments_count,
            ]);
            $finalData["beneficiaries"] = collect();
        }

        $finalData["logs"] = AprLog::where("apr_id", $submittedDatabase->id)
            ->with("user:id,name")
            ->orderBy("created_at", "asc")
            ->get()
            ->map(fn ($log) => [
                "action" => $log->action,
                "comment" => $log->comment,
                "user" => $log->user?->name,
                "created_at" => optional($log->created_at)->format("Y-m-d H:i:s"),
            ]);

        return response()->json([
            'status'  => true,
            'message' => null,
            'data'    => $finalData,
        ]);
    }

    public function destroy (Request $request)
    {
        $validated = $request->validate([
            "ids" => "required|array",
            "ids.*" => "required|integer",
        ]);

        $ids = $validated["ids"];

        Apr::whereIn("id", $ids)->delete();

        return response()->json(["status" => true, "message" => "Selected apr's successfully removed !"], 200);
    }

    public function changeDatabaseStatus(Request $request, string $id)
    {
        $validated = $request->validate([
            "newStatus" => "required|in:firstApproved,firstRejected,secondApproved,secondRejected",
            "comment"   => "nullable|string|max:1000",
        ]);

        $apr = Apr::find($id);

        if (!$apr) {
            return response()->json([
                "status" => false,
                "message" => "No such APR found in the system.",
            ], 404);
        }

        $approver = User::find(Auth::id());
        $approverName = $approver ? $approver->name : 'Unknown user';

        $responsibleUsersForCommingStep = User::permission('Database_submission.view')->get();

        if ($responsibleUsersForCommingStep->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "The system cannot update the APR status because there is no available user with the role HoD, DHoD, or FM to forward the APR.",
            ]);
        }

        $apr->status = $validated["newStatus"];
        $apr->save();

        AprLog::create([
            "apr_id" => $apr->id,
            "user_id" => Auth::id(),
            "action" => $validated["newStatus"],
            "comment" => $validated["comment"] ?? null
        ]);

        $isApproved = $validated["newStatus"] === "firstApproved";

        $notificationTitle = $isApproved
            ? "Database Approved"
            : "Database Rejected";

        $notificationMessage = $isApproved
            ? "A new database has been approved. Please review it."
            : "The database you submitted has been rejected by {$approverName}" . ($validated["comment"] ? " with comment: " . $validated["comment"] : ".");

        $notification = Notification::create([
            "title"   => $notificationTitle,
            "message" => $notificationMessage,
            "type"    => "submittedDatabase",
            "apr_id"  => $apr->id,
        ]);

        if ($validated["newStatus"] == "firstApproved")
            foreach ($responsibleUsersForCommingStep as $user) {
                $user->notifications()->attach($notification->id, ['readAt' => false]);
                event(new MessageSent($user->id, $notificationMessage));
            }
        else {

            $correspondingAprLogInSubmitStage = AprLog::where("action", "submitted")->where("apr_id", $apr->id)->first();

            if (!$correspondingAprLogInSubmitStage)
                return response()->json(["status" => false, "message" => "Warning: The system could not find selected apr log in submitted stage so it can not notify anyone to check it !"]);

            $submitter = User::find($correspondingAprLogInSubmitStage->user_id);

            if (!$submitter)
                return response()->json(["status" => false, "message" => "Warning: The system could not find selected apr submitter, so it can not notify anyone to check it !"]);
            $submitter->notifications()->attach($notification->id, ['readAt' => false]);
            event(new MessageSent($submitter->id, $notificationMessage));

        }

        $messageHelperWord = $isApproved ? "Approved" : "Rejected";

        return response()->json([
            "status"  => true,
            "message" => "APR status changed to {$messageHelperWord}.",
        ], 200);
    }

    public function submitNewDatabase (StoreNewAprRequest $request)
    {   
        $validated = $request->validated();

        $validated["status"] = "submitted";

        $exist = Apr::where("project_id", $validated["project_id"])->where("database_id", $validated["database_id"])->where("province_id", $validated["province_id"])->where("fromDate", $validated["fromDate"])->where("toDate", $validated["toDate"])->first();

        if ($exist) return response()->json(["status" => true, "message" => "Selected database has been previosly submitted !"], 200);

        $createdDatabase = Apr::create($validated);

        $selectedManagerId = $validated["manager_id"];

        $manager = User::find($selectedManagerId);

        $notification = Notification::create([
            "title" => "New database submitted !",
            "message" => "A new database has been submitted check it now !",
            "type" => "submittedDatabase",
            "apr_id" => $createdDatabase->id
        ]);

        $manager->notifications()->attach($notification->id, ['readAt' => false]);

        event(new MessageSent($selectedManagerId, 
        
        "New database submitted !"
    
        ));

        AprLog::create([
            "apr_id" => $createdDatabase->id,
            "user_id" => Auth::id(),
            "action" => "submitted",
            "comment" => $validated["comment"] ?? null
        ]);

        return response()->json(["status" => true, "message" => "New database successfully submitted !"], 200);
    }

    public function editSubmittedDatabase(UpdateAprRequest $request, string $aprId)
    {
        error_log("Entered editSubmittedDatabase method.");
        $validated = $request->validated();

        $apr = Apr::findOrFail($aprId);

        $exist = Apr::where("project_id", $validated["project_id"])
            ->where("database_id", $validated["database_id"])
            ->where("province_id", $validated["province_id"])
            ->where("fromDate", $validated["fromDate"])
            ->where("toDate", $validated["toDate"])
            ->where("id", "!=", $apr->id)
            ->first();

        if ($exist) {
            return response()->json([
                "status" => true,
                "message" => "Selected database has been previously submitted !"
            ], 200);
        }

        // Update APR
        $validated["status"] = "resubmitted";

        $apr->update($validated);

        $selectedManagerId = $validated["manager_id"];
        $manager = User::find($selectedManagerId);

        // Notification
        $notification = Notification::create([
            "title" => "Database re-submitted !",
            "message" => "A submitted database has been updated. Please review it.",
            "type" => "submittedDatabase",
            "apr_id" => $apr->id
        ]);

        $manager->notifications()->attach($notification->id, [
            'readAt' => false
        ]);

        event(new MessageSent(
            $selectedManagerId,
            "Database re-submitted !"
        ));

        // Log
        AprLog::create([
            "apr_id" => $apr->id,
            "user_id" => Auth::id(),
            "action" => "resubmitted",
            "comment" => $validated["comment"] ?? null
        ]);

        return response()->json([
            "status" => true,
            "message" => "Database successfully re-submitted !"
        ], 200);
    }


    public function getDatabaseInfoForEditing(string $id)
    {
        $apr = Apr::find($id);

        if (!$apr) {
            return response()->json([
                "status" => false,
                "message" => "No such APR found in the system.",
            ], 404);
        }

        $finalData = [
            "project" => [
                "id" => $apr->project->id,
                "projectCode" => $apr->project->projectCode,
            ],
            "database" => [
                "id" => $apr->database->id,
                "name" => $apr->database->name,
            ],
            "province" => [
                "id" => $apr->province->id,
                "name" => $apr->province->name,
            ],
            "manager" => [
                "id" => $apr->manager->id,
                "name" => $apr->manager->name,
            ],
            "fromDate" => $apr->fromDate,
            "toDate" => $apr->toDate,
        ];

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $finalData
        ], 200);
    }
}
