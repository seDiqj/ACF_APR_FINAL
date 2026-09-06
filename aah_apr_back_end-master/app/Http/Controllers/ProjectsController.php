<?php

namespace App\Http\Controllers;

use App\Constants\RequestResponses;
use App\Constants\System;
use App\Events\MessageSent;
use App\Http\Requests\StoreProjectRequest;
use App\Models\Apr;
use App\Models\Beneficiary;
use App\Models\Database;
use App\Models\Dessaggregation;
use App\Models\Enact;
use App\Models\Indicator;
use App\Models\IndicatorType;
use App\Models\Notification;
use App\Models\Outcome;
use App\Models\Output;
use App\Models\Project;
use App\Models\ProjectLogs;
use App\Models\Province;
use App\Models\Referral;
use App\Models\Sector;
use App\Models\Training;
use App\Models\User;
use App\Services\DatabaseServices\DatabaseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class ProjectsController extends Controller
{

    public function indexProjects(Request $request) 
    {
        $query = Project::query();

        if ($search = request("search")) {
            $codes = explode(',', $search);
            $query->where(function ($q) use ($codes) {
                foreach ($codes as $code) {
                    $q->orWhere("projectCode", "like", "%" . $code . "%");
                }
            });
        }

        $query->when($request->filled('projectCode'), function ($q) use ($request) {
            $q->whereIn('id', (array) $request->input('projectCode'));
        });

        $query->when($request->filled("province"), function ($q) use ($request) {
            $q->whereHas("provinces", function ($q) use ($request) {
                $q->whereIn("provinces.id", (array) $request->input("province"));
            });
        });

        $query->when($request->filled("thematicSector"), function ($q) use ($request) {
            $q->whereHas("sectors", function ($q) use ($request) {
                $q->whereIn("sectors.id", (array) $request->input("thematicSector"));
            });
        });

        if ($request->filled('projectManager')) {
            $requestedManagers = explode(",", $request->input("projectManager"));
            $query->whereIn('projectManager', $requestedManagers);
        }

        if ($request->filled('startDate') && $request->filled('endDate')) {

            $query->whereBetween('startDate', [$request->startDate, $request->endDate]);

        } elseif ($request->filled('startDate')) {

            $query->where('startDate', '>=', $request->startDate);

        } elseif ($request->filled('endDate')) {

            $query->where('endDate', '<=', $request->endDate);
            
        }

        if ($request->filled('status')) {
            $query->whereIn('status', (array) $request->input("status"));
        }

        $perPage = $request->integer("perPage", 10);
        $order = $request->str("order", "desc");

        $projects = $query->orderBy("created_at", $order)->paginate($perPage);

        if ($projects->isEmpty()) return response()->json(["status" => false, "message" => "No project available in database records", "data" => []], 200);

        return response()->json(["status" => true, "message" => "", "data" => $projects]);
    }

    public function indexProjectsThatHasAtleastOneIndicatorWhichBelongsToSpicificDatabase(string $databaseName, DatabaseService $databaseService)
    {
        $database = $databaseService->getDatabaseViaName($databaseName);

        if ($database == System::SYSTEM_DATABASE_404) 
            return RequestResponses::notFound404("No such database in system with name " . strtoupper($databaseName));
        

        $projects = Project::whereHas('outcomes.outputs.indicators', function ($query) use ($database) {
            $query->where('database_id', $database->id);
        })
        ->with(['outcomes.outputs.indicators' => function ($query) use ($database) {
            $query->where('database_id', $database->id);
        }])
        ->where("aprStatus", "hqFinalized")
        ->where("status", "ongoing")
        ->get();

        if ($projects->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No projects was found with indicators in database " . strtoupper(join(" ", explode("_", $databaseName))) . " Note: A project should have at least one indicator which belongs to " . $databaseName . " and also it has to be finalized at HQ level and with on going status to be listed in MYSPACE section."
            ], 404);
        }

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $projects
        ]);
    }

    public function indexProjectOutcomes(string $id) 
    {

        $project = Project::with("outcomes")->find($id);
        
        $outcomes = $project->outcomes();

        if (!$outcomes) return response()->json(["status" => false, "message" => "Project has no outcome"], 404);

        return response()->json(["status" => true, "message" => "", "data" => $outcomes]);
    }

    public function indexProjectIndicators(string $id) 
    {

        $project = Project::with('outcomes.outputs.indicators')->find($id);

        $indicators = $project->outcomes
        ->flatMap(fn($outcome) => $outcome->outputs)
        ->flatMap(fn($output) => $output->indicators);

        if (!$indicators) return response()->json(["status" => false, "message" => "Project has no indicator"], 404);

        return response()->json(["status" => true, "message" => "", "data" => $indicators]);

    }

    public function indixProjectSpicificDatabaseIndicator(string $databaseName, string $id)
    {

        if (!($databaseName == "all")) {
            $database = Database::where("name", $databaseName)->first();
            if (!$database) {
                return response()->json([
                    "status" => false,
                    "message" => "Database $databaseName not found!"
                ], 404);
            }
        }

        $project = Project::with('outcomes.outputs.indicators')->find($id);

        if (!$project) {
            return response()->json([
                "status" => false,
                "message" => "No such project in system !"
            ], 404);
        }

        if ($databaseName == "all")

            $indicators = $project->outcomes
                ->flatMap(fn($outcome) => $outcome->outputs)
                ->flatMap(fn($output) => $output->indicators)
                ->values();
        else
        
            $indicators = $project->outcomes
                ->flatMap(fn($outcome) => $outcome->outputs)
                ->flatMap(fn($output) => $output->indicators)
                ->filter(fn($indicator) => $indicator->database_id == $database->id)
                ->values();

        if ($indicators->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No indicators found for this project in database $databaseName!"
            ], 404);
        }

        $indicators = $indicators->map(function ($indicator) {
            $newIndicator = [];

            $newIndicator["id"] = $indicator->id;
            $newIndicator["indicatorRef"] = $indicator->indicatorRef;

            return $newIndicator;
        });

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $indicators
        ]);
    }

    public function indexProjectProvinces (string $id)
    {
        $project = Project::find($id);

        if (!$project) return response()->json(["status" => false, "message" => "No such project in system !"], 404);

        $provinces = $project->provinces()->select("provinces.id", "provinces.name")->get();

        if ($provinces->isEmpty()) return response()->json(["status" => false, "message" => "No province was found for selected project !"], 404);

        return response()->json(["status" => true, "message" => "", "data" => $provinces]);
    }

    public function indexProjectLogs (string $id) 
    {
        $project = Project::find($id);

        if (!$project) return response()->json(["status" => false, "message" => "No such project in system !"], 404);

        $logs = $project->logs;

        if ($logs->isEmpty()) return response()->json(["status" => false, "message" => "No log was found for project " . $project->projectCode, "data" => []], 200);

        $logs = $logs->map(function ($log) use ($project) {
            $log["projectCode"] = $project->projectCode;
            $log["userName"] = Auth::user()->name;
            $log["date"] = \Carbon\Carbon::parse($log["created_at"])->diffForHumans();

            unset($log["project_id"], $log["user_id"], $log["created_at"]);

            return $log;
        });

        return response()->json(["status" => true, "message" => "", "data" => $logs], 200);
    }

    public function indexProjectsForSubmitting()
    {

        $projects = Project::where("aprStatus", "hqFinalized")->select("id", "projectCode")->get();

        if ($projects->isEmpty()) return response()->json(["status" => false, "message" => "No projects found for submitting \n Note: A project should be finalized by HQ to select for submitting process !", "data" => []], 404);

        return response()->json(["status" => true, "message" => "", "data" => $projects]);

    }

    public function indexProjectNecessaryDataForSubmition (string $id)
    {
        $project = Project::find($id);

        if (!$project) return response()->json(["status" => false, "message" => "No such project in system"], 404);

        $projectProvinces = $project->provinces;

        $projectProvinces = $projectProvinces->map(function ($province) {
            unset($province->pivot);
            return $province;
        });

        $projectDatabasesIds = $project->programs()->pluck("database_id")->toArray();

        $projectDatabases = Database::whereIn("id", array_unique($projectDatabasesIds))->get();

        if (Enact::where("project_id", $project->id)->first())
        {
            $enactDatabase = Database::where("name", "enact_database")->first();
            
            if ($enactDatabase)
                $projectDatabases->push($enactDatabase);

        }
        
        if (Training::where("project_id", $project->id)->first()) {

            $trainingDatabase = Database::where("name", "training_database")->first();
            if ($trainingDatabase)
                $projectDatabases->push($trainingDatabase);

        }

        if (Referral::whereHas("indicator", function ($q) use ($project) {
            $q->whereHas("output", function ($q2) use ($project) {
                $q2->whereHas("outcome", function ($q3) use ($project) {
                    $q3->where("project", function ($q4) use ($project) {
                        $q4->where("project.id", $project->id);
                    });
                });
            });
        })) {

            $refferalDatabase = Database::where("name", "refferal_database")->first();
            if ($refferalDatabase)
                $projectDatabases->push($refferalDatabase);

        }

        if (Beneficiary::whereHas("mealTools")->first()) {

            $mainDatabaseTargetMealtool = Database::where("name", "main_database_meal_tool")->first();
            if ($mainDatabaseTargetMealtool)
                $projectDatabases->push($mainDatabaseTargetMealtool);

        }

        $finalData = [
            "provinces" => $projectProvinces,
            "databases" => $projectDatabases,
        ];

        return response()->json(["status" => true, "message" => "", "data" => $finalData]);
    }

    public function indexSubmittedDatabases ()
    {
        $databases = Apr::where("status", "submitted")->get();

        if ($databases->isEmpty()) return response()->json(["status" => false, "message" => "No database with submitted status !"], 404);

        $databases = $databases->map(function ($database) {
            $database["projectCode"] = Project::find($database["project_id"])->projectCode;
            $database["database"] = Database::find($database["database_id"])->name;
            $database["province"] = Province::find($database["province_id"])->name;

            unset($database["project_id"], $database["database_id"], $database["province_id"]);

            return $database;
        });

        return response()->json(["status" => true, "message" => "", "data" => $databases]);
    }

    public function storeProject(StoreProjectRequest $request)
    {
        $validated = $request->validated();

        $validated["aprStatus"] = "notCreatedYet";

        $project = Project::create($validated);

        $thematicSectorNames = $request->input("thematicSector", []);

        $thematicSectorids = Sector::whereIn("name", $thematicSectorNames)->pluck("id")->toArray();

        $project->sectors()->sync($thematicSectorids);

        $provinceNames = $request->input("provinces", []);

        $provinceIds = Province::whereIn("name", $provinceNames)->pluck("id", "name")->toArray();

        $project->provinces()->sync($provinceIds);

        $outcome = Outcome::create([
            "project_id" => $project->id,
            "outcome" => "$ NO-OUTCOME#NO-OUTCOME $",
            "outcomeRef" => "$ NO-OUTCOME-REF#NOOUTCOME-REF $"
        ]);

        $finalData = [
            "project" => $project,
            "outcome" => $outcome
        ];

        return response()->json(["status" => true, "message" => "Project successfully created !", "data" => $finalData], 200);
    }
    
    public function showProject(string $id) {

        $project = Project::with(["outcomes.outputs.indicators.dessaggregations", "provinces", "sectors"])->find($id);

        if (!$project) return response()->json(["status" => false, "message" => "No such project in database !"], 404);

        $project["outcomesInfo"] = $project->outcomes;

        unset($project["outcomes"]);

        $project->outcomesInfo->map(function ($outcome) {

            $outcome->outputs->map(function ($output) {

                $output->indicators->map(function ($indicator) {

                    $indicator["provinces"] = Indicator::find($indicator["id"])->provinces;
                    $indicator["isp3"] = $indicator->isp3;
                    $indicator["database"] = Database::find($indicator["database_id"])->name;
                    
                    if ($indicator['database'] == "main_database" && $indicator->type_id)
                        $indicator["type"] = IndicatorType::find($indicator->type_id)->type;

                    
                    unset(
                        $indicator["database_id"],
                        $indicator["type_id"],
                    );

                    $indicator["provinces"] = $indicator->provinces->map(function ($province) {

                        $province["province"] = $province["name"];
                        $province["target"] = $province["pivot"]["target"];
                        $province["councilorCount"] = $province["pivot"]["councilorCount"];

                        unset(
                            $province["name"],
                            $province["id"],
                            $province["indicator_id"],
                        );

                        return $province;

                    });

                    $indicator->dessaggregations->map(function ($dessaggregation) use ($indicator) {

                        $dessaggregation["dessaggration"] = $dessaggregation["description"];
                        $dessaggregation["province"] = Province::find($dessaggregation["province_id"])->name;
                        $dessaggregation["indicatorRef"] = $indicator->indicatorRef;
                        $dessaggregation["indicatorId"] = $dessaggregation->indicator_id;

                        unset(
                            $dessaggregation["description"],
                            $dessaggregation["created_at"],
                            $dessaggregation["updated_at"],
                            $dessaggregation["description"],
                            $dessaggregation["province_id"],
                            $dessaggregation["achived_target"],
                            $dessaggregation["id"],
                            $dessaggregation["months"],
                        );

                        return $dessaggregation;
                    });

                    return $indicator;

                });

                return $output;

            });

            return $outcome;

        });

        $project["provinces"] = $project->provinces->map(function ($province) {

            $provinceName = $province->name;

            return $provinceName;

        });

        $project["thematicSector"] = $project->sectors->map(function ($sector) {
            return $sector->name;
        });

        $project = $project->toArray();

        $project["startDate"] = Carbon::parse($project["startDate"])->format("Y-m-d");
        $project["endDate"] = Carbon::parse($project["endDate"])->format("Y-m-d");

        unset($project["sectors"]);

        return response()->json(["status" => true, "message" => "", "data" => $project]);

    }

    public function updateProject(Request $request, string $id)
    {
        $project = Project::find($id);

        if (!$project) return response()->json(["status" => false, "message" => "No such project in database !"], 404);

        $validated = $request->validate([
            'projectCode'      => ['required', 'string', 'max:255'],
            'projectTitle'     => 'required|string|max:255',
            'projectGoal'      => 'required|string|max:255',
            'projectDonor'     => 'required|string|max:255',
            'startDate'        => 'required|date',
            'endDate'          => 'required|date|after_or_equal:startDate',
            'status'           => 'required|in:planed,ongoing,completed,onhold,canclled',
            'projectManager'   => 'required|string|max:255',
            'reportingDate'    => 'required|string|max:255',
            'reportingPeriod'  => 'required|string|max:255',
            'description'      => 'nullable|string',
            'provinces'        => 'required|array',
            'provinces.*'      => 'exists:provinces,name',
            'thematicSector'   => 'required|array',
            'thematicSector.*' => 'exists:sectors,name'
        ]);

        $provinceIds = Province::whereIn("name", $validated["provinces"])->pluck("id")->toArray();
        $sectorIds = Sector::whereIn('name', $validated["thematicSector"])->pluck('id')->toArray();

        $project->provinces()->sync($provinceIds);
        $project->sectors()->sync($sectorIds);

        $project->update($validated);

        return response()->json(["status" => true, "message" => "Project successfully updated !"], 200);
    }

    public function updateProjectFull(Request $request, string $id)
    {
        $project = Project::find($id);
        if (!$project) {
            return response()->json(["status" => false, "message" => "No such project in database!"], 404);
        }

        $validatedProject = $request->validate([
            'projectCode'      => ['required', 'string', 'max:255', Rule::unique('projects', 'projectCode')->ignore($project->id)],
            'projectTitle'     => 'required|string|max:255',
            'projectGoal'      => 'required|string|max:255',
            'projectDonor'     => 'required|string|max:255',
            'startDate'        => 'required|date',
            'endDate'          => 'required|date|after_or_equal:startDate',
            'status'           => 'required|in:planed,ongoing,completed,onhold,canclled',
            'aprStatus'        => 'required|in:NotCreatedYet,created,hodDhodApproved,grantFinalized,hqFinalized',
            'projectManager'   => 'required|string|max:255',
            'reportingDate'    => 'required|string|max:255',
            'reportingPeriod'  => 'required|string|max:255',
            'description'      => 'nullable|string',
            'provinces'        => 'nullable|array',
            'provinces.*'      => 'string',
            'thematicSector'   => 'nullable|array',
            'thematicSector.*' => 'string',
        ]);

        $project->update($validatedProject);

        // 2️⃣ Update Outcomes by ID
        if ($request->has('outcomes') && is_array($request->outcomes)) {
            foreach ($request->outcomes as $outcomeData) {
                if (!empty($outcomeData['id'])) {
                    Outcome::where('id', $outcomeData['id'])
                        ->update(['outcome' => $outcomeData['outcome']]);
                }
            }
        }

        // 3️⃣ Update Outputs by ID
        if ($request->has('outputs') && is_array($request->outputs)) {
            foreach ($request->outputs as $outputData) {
                if (!empty($outputData['id'])) {
                    Output::where('id', $outputData['id'])
                        ->update([
                            'output' => $outputData['output'],
                            'outcome_id' => $outputData['outcome_id'] ?? null
                        ]);
                }
            }
        }

        // 4️⃣ Update Indicators by ID
        if ($request->has('indicators') && is_array($request->indicators)) {
            foreach ($request->indicators as $indicatorData) {
                if (!empty($indicatorData['id'])) {
                    Indicator::where('id', $indicatorData['id'])
                            ->update([
                                'indicator' => $indicatorData['indicator'],
                                'output_id' => $indicatorData['output_id'] ?? null,
                                'dessaggregationType' => $indicatorData['dessaggregationType'] ?? null,
                            ]);
                }
            }
        }

        // 5️⃣ Update Dessaggregations by ID
        if ($request->has('dessaggregations') && is_array($request->dessaggregations)) {
            foreach ($request->dessaggregations as $dessData) {
                if (!empty($dessData['id'])) {
                    Dessaggregation::where('id', $dessData['id'])
                                ->update([
                                    'description' => $dessData['description'],
                                    'target' => $dessData['target'],
                                ]);
                }
            }
        }

        return response()->json([
            "status" => true,
            "message" => "Project and all related data successfully updated!"
        ], 200);
    }

    public function destroyProject(Request $request) 
    {
        $ids = $request->input("ids");

        $request->validate([
            "ids" => "required|array",
            "ids.*" => "integer"
        ]);

        $projects = Project::whereIn("id", $ids)->get();

        foreach ($projects as $project) {
            $project->delete(); 
        }

        return response()->json(["status" => true, "message" => "Project successfully deleted!"], 200);
    }

    public function destroySubmittedDatabase (Request $request)
    {
        $request->validate([
            "ids" => "required|array",
            "ids.*" => "required|integer"
        ]);

        $ids = $request->ids;

        Apr::whereIn("id", $ids)->delete();

        return response()->json(["status" => true, "message" => "Submitted databases successfully deleted from submitted databases table !"], 200);
    }

    public function changeAprStatus (Request $request, string $id) 
    {
        $validated = $request->validate([
            'newStatus' => 'required|in:notCreatedYet,created,hodDhodApproved,hodDhodRejected,grantFinalized,grantRejected,hqFinalized,hqRejected',
            'comment' => 'nullable|string',
        ]);

        $userId = Auth::user()->id;

        if (!$userId) return response()->json(["status" => false, "message" => "Forbiden Unauthinticated !"], 403);

        $project = Project::find($id);

        if (!$project) return response()->json(["status" => false, "message" => "No such project in system !"], 404);

        $currentStatus = $project->aprStatus;

        if ($currentStatus == $validated["newStatus"]) return response()->json(["status" => false, "message" => "Project status is already " . $validated["newStatus"]], 422);

        $newStatus = $validated["newStatus"];

        $project->aprStatus = $newStatus;

        $project->save();

        $action = null;

        switch ($newStatus) {
            case 'notCreatedYet':
                $action = 'reset';
                break;

            case 'created':
                $action = 'create';
                $notification = Notification::create([
                    "title" => "Project created",
                    "message" => "A new project has been created check it now !",
                    "type" => "project",
                    "project_id" => $project->id
                ]);

                $responsibleUsersForCommingSteps = User::permission("Project.submit")->get();

                if ($responsibleUsersForCommingSteps->isEmpty()) return response()->json(["status" => false, "message" => "No user with the 'Project Submit' permission was found, so the system cannot notify anyone to forward the project."], 404);

                foreach ($responsibleUsersForCommingSteps as $user) {
                    $user->notifications()->attach($notification->id, ["readAt" => false]);
                    event(new MessageSent($user->id, $notification->message));
                }
                break;

            case 'hodDhodApproved':
                $action = 'submit';

                $notification = Notification::create([
                    "title" => "Project submitted",
                    "message" => "A new project has been submitted check it now !",
                    "type" => "project",
                    "project_id" => $project->id
                ]);

                $responsibleUsersForCommingSteps = User::permission("Project.grantFinalize")->get();

                if ($responsibleUsersForCommingSteps->isEmpty()) return response()->json(["status" => false, "message" => "No user with the 'Project grant finalized' permission was found, so the system cannot notify anyone to forward the project."], 404);

                foreach ($responsibleUsersForCommingSteps as $user) {
                    $user->notifications()->attach($notification->id, ["readAt" => false]);
                    event(new MessageSent($user->id, $notification->message));
                }
                break;

            case 'hodDhodRejected':
                $action = 'rejectSubmit';

                $projectCorrespondingLog = ProjectLogs::where("action", "create")->where("project_id", $project->id)->first();

                if (!$projectCorrespondingLog) return response()->json(["status" => false, "message" => "The system could not find the current project log in submitted stage, so it can not notify anyone to check it !"]);

                $creator = User::find($projectCorrespondingLog->user_id);

                if (!$creator) return response()->json(["status" => false, "message" => "The system could not find the user that has created the project, so it can not notify anyone to check it !"]);

                $notification = Notification::create([
                    "title" => "Project rejected",
                    "message" => "The project that you created has been rejected by " . Auth::user()->name . " check it now !",
                    "type" => "project",
                    "project_id" => $project->id
                ]);

                $creator->notifications()->attach($notification->id, ["readAt" => false]);

                event(new MessageSent($creator->id, $notification->message));

                break;

            case 'grantFinalized':
                $action = 'grantFinalize';

                $notification = Notification::create([
                    "title" => "Project grant finalized",
                    "message" => "A new project has been finalized at the grant stage check it now !",
                    "type" => "project",
                    "project_id" => $project->id
                ]);

                $responsibleUsersForCommingSteps = User::permission("Project.HQFinalize")->get();

                if ($responsibleUsersForCommingSteps->isEmpty()) return response()->json(["status" => false, "message" => "No user with the 'Project HQ finalized' permission was found, so the system cannot notify anyone to forward the project."], 404);

                foreach ($responsibleUsersForCommingSteps as $user) {
                    $user->notifications()->attach($notification->id, ["readAt" => false]);
                    event(new MessageSent($user->id, $notification->message));
                }

                break;

            case 'grantRejected':
                $action = 'rejectGrant';

                $projectCorrespondingLog = ProjectLogs::where("action", "submit")->where("project_id", $project->id)->first();

                if (!$projectCorrespondingLog) return response()->json(["status" => false, "message" => "The system could not find the current project log in submitted stage, so it can not notify anyone to check it !"]);

                $submitter = User::find($projectCorrespondingLog->user_id);

                if (!$submitter) return response()->json(["status" => false, "message" => "The system could not find the user that has submitted the project, so it can not notify anyone to check it !"]);

                $notification = Notification::create([
                    "title" => "Project rejected",
                    "message" => "The project that you submitted has been rejected by " . Auth::user()->name . " check it now !",
                    "type" => "project",
                    "project_id" => $project->id
                ]);

                $submitter->notifications()->attach($notification->id, ["readAt" => false]);

                event(new MessageSent($submitter->id, $notification->message));

                break;

            case 'hqFinalized':
                $action = 'hqFinalize';

                $notification = Notification::create([
                    "title" => "Project HQ finalized",
                    "message" => "A new project has been finalized at the HQ stage check it now !",
                    "type" => "project",
                    "project_id" => $project->id
                ]);

                $responsibleUsersForCommingSteps = User::permission("Project.HQFinalize")->get();

                foreach ($responsibleUsersForCommingSteps as $user) {
                    $user->notifications()->attach($notification->id, ["readAt" => false]);
                    event(new MessageSent($user->id, $notification->message));
                }

                break;

            case 'hqRejected':
                $action = 'rejectHq';

                $projectCorrespondingLog = ProjectLogs::where("action", "grantFinalize")->where("project_id", $project->id)->first();

                if (!$projectCorrespondingLog) return response()->json(["status" => false, "message" => "The system could not find the current project log in grant finalize stage, so it can not notify anyone to check it !"]);

                $grantFinalizer = User::find($projectCorrespondingLog->user_id);

                if (!$grantFinalizer) return response()->json(["status" => false, "message" => "The system could not find the user that has finalized at the grant stage the project, so it can not notify anyone to check it !"]);

                $notification = Notification::create([
                    "title" => "Project rejected",
                    "message" => "The project that you finalized at the grant stage has been rejected by " . Auth::user()->name . " check it now !",
                    "type" => "project",
                    "project_id" => $project->id
                ]);

                $grantFinalizer->notifications()->attach($notification->id, ["readAt" => false]);

                event(new MessageSent($grantFinalizer->id, $notification->message));

                break;

            default:
                $action = 'unknown';
                break;
        }


        ProjectLogs::create([
            "project_id" => $project->id,
            "user_id" => $userId,
            "action" => $action,
            "comment" => $validated["comment"],
            "result" => array_key_exists("result", $validated) ? $validated["result"] : null,
        ]);

        return response()->json(["status" => true, "message" => "Project APR status updated successfully. \n Check the logs!", "data" => $validated["newStatus"]]);
        
    }

    public function getProjectFinalizersDetails(string $id)
    {
        $logs = ProjectLogs::with('user')
            ->where('project_id', $id)
            ->orderBy('created_at', 'asc')
            ->get();

        $finalizers = $logs->map(function ($log) {
            return [
                'user_id' => $log->user_id,
                'name' => $log->user ? $log->user->name : null,
                'role' => $log->user ? optional($log->user->roles->first)->name : null,
                'avatar' => $log->user ? url("storage/" . $log->user->photo_path) : null,
                'action' => $log->action,
                'comment' => $log->comment,
                'result' => $log->result,
                'step' => $log->project_step ?? null,
                'date' => $log->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $finalizers,
        ]);
    }

    public function getProjectDateRange(string $id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'status' => false,
                'message' => 'No such project in system!',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'message' => '',
            'data' => [
                'startDate' => $project->startDate,
                'endDate' => $project->endDate,
            ],
        ]);
    }

}
