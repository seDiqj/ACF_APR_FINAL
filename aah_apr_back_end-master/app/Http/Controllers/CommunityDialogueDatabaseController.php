<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCdDatabaseBeneficiary;
use App\Http\Requests\StoreCommunityDialogueRequest;
use App\Http\Requests\UpdateCdDatabaseBeneficiary;
use App\Http\Requests\UpdateCommunityDialogueRequest;
use App\Models\Beneficiary;
use App\Models\BeneficiaryCommunityDialogueSession;
use App\Models\CommunityDialogue;
use App\Models\CommunityDialogueSession;
use App\Models\Database;
use App\Models\DatabaseProgramBeneficiary;
use App\Models\District;
use App\Models\Group;
use App\Models\Indicator;
use App\Models\Program;
use App\Models\Project;
use App\Models\Province;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Jobs\AttachBeneficiariesToSession;
use Illuminate\Support\Facades\Auth;

class CommunityDialogueDatabaseController extends Controller
{
    public function indexBeneficiaries (Request $request)
    {

        $communityDialogueDb = Database::where("name", "cd_database")->first();

        if (!$communityDialogueDb) return response()->json(["status" => false, "message" => "Community dialogue is not a valid database !"], 404);

        $communityDialogueDbId = $communityDialogueDb->id;

        $CommunityDialogueBeneficiaries = DatabaseProgramBeneficiary::where("database_id", $communityDialogueDbId)->pluck("beneficiary_id")->toArray();

        $query = Beneficiary::query()
            ->with(['programs.project', 'indicators']);

        $query->whereIn("id", $CommunityDialogueBeneficiaries);

        if ($request->filled('projectCode') || $request->filled('focalPoint') || $request->filled('province')) {

            $query->whereHas('programs', function($q) use ($request, $communityDialogueDbId) {
            if ($request->filled('projectCode')) {
                $q->whereHas('project', function($q2) use ($request) {
                    $q2->whereIn('id', (array) $request->input('projectCode'));
                });
            }

            if ($request->filled('focalPoint')) {
                $focalPoints = explode(",", $request->input("focalPoint"));
                $q->whereIn('focalPoint', $focalPoints);
            }

            if ($request->filled('province')) {
                $q->whereHas("province", function ($q2) use ($request) {
                    $q2->whereIn("id", (array) $request->input("province"));
                });
            }

        });

        }

        if ($request->filled('dateOfRegistration')) {
            $dates = explode(",", $request->input("dateOfRegistration"));
            $query->whereIn('dateOfRegistration', $dates);
        }

        if ($request->filled('age')) {
            $ages = explode(",", $request->input("age"));
            $query->where(function ($q) use ($ages) {
                foreach ($ages as $age) {
                    $q->orWhere("age", $age);
                }
            });
        }

        if ($request->filled('indicator')) {
            $query->whereHas('indicators', function($q) use ($request) {
                $q->whereIn('indicators.id', (array) $request->input("indicator"));
            });
        }

        if ($search = $request->input("search")) {
            $searchItems = array_map('trim', explode(",", $search));

            $query->where(function($q) use ($searchItems) {
                foreach ($searchItems as $item) {
                    $q->orWhere('name', 'like', "%{$item}%")
                    ->orWhere('fatherHusbandName', 'like', "%{$item}%")
                    ->orWhere('code', 'like', "%{$item}%");
                }
            });
        }

        if ($request->filled('code')) {
            $namesOrCodes = explode(",", $request->input("code"));
            $query->where(function ($q) use ($namesOrCodes) {
                foreach ($namesOrCodes as $nameOrCode) {
                    $q->orWhere("code", "like", "%" . $nameOrCode . "%")
                        ->orWhere("name", "like", "%" . $nameOrCode . "%")
                        ->orWhere("fatherHusbandName", "like", "%" . $nameOrCode . "%");
                }
            });
        }

        $perPage = $request->integer("perPage", 10);
        $order = $request->str("order", "desc");

        $beneficiaries = $query->orderBy("created_at", $order)->paginate($perPage);

        if ($beneficiaries->isEmpty()) return response()->json(["status" => false, "message" => "No beneficiary was found !", "data" => []], 200);

        $beneficiaries->getCollection()->transform(function ($bnf) {
            $bnf->programName = optional($bnf->programs->first())->name;
            unset($bnf->programs);
            return $bnf;
        });

        return response()->json(["status" => true, "message" => "" , "data" => $beneficiaries]);
    }

    public function indexCommunityDialogues(Request $request)
    {
        $query = CommunityDialogue::query()
            ->with([
                'program',
                'indicator',
                'sessions',
                'groups'
            ]);

        if ($request->filled('projectCode')) {
            $codes = $request->input('projectCode');
            $query->whereIn('project_id', $codes);
        }

        if ($request->filled('focalPoint')) {
            $query->whereHas('program', function ($q) use ($request) {
                $points = explode(',', $request->input('focalPoint'));
                $q->whereIn('focalPoint', $points);
            });
        }

        if ($request->filled('province')) {
            $provinceIds = $request->input('province');
            $query->whereIn('province_id', $provinceIds);
        }

        if ($request->filled('indicator')) {
            $query->whereHas('indicator', fn ($q) =>
                $q->whereIn('indicator_id', $request->input('indicator'))
            );
        }

        if ($request->input("search")) {
            $names = explode(',', $request->input('search'));
            $query->whereIn("name", $names);
        }

        $perPage = $request->integer("perPage", 10);
        $order = $request->str("order", "desc");

        $cds = $query->orderBy("created_at", $order)->paginate($perPage);

        if ($cds->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No community dialogue was found!",
                "data" => []
            ], 200);
        }

        $cds->getCollection()->transform(function ($cd) {
            return [
                'id' => $cd->id,
                'name' => $cd->name,
                'projectCode' => $cd->program?->project?->projectCode,
                'province' => $cd->program?->province?->name,
                'district' => $cd->program?->district?->name,
                'indicator' => $cd->indicator?->indicatorRef,
                'village' => $cd->program?->village,
                'focalPoint' => $cd->program?->focalPoint,
                'numOfSessions' => $cd->sessions->count(),
                'numOfGroups' => $cd->groups->count(),
            ];
        });

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $cds
        ]);
    }

    public function indexCommunityDialoguesForSelection()
    {
        $communityDialogues = CommunityDialogue::with("groups")->select(["id", "name"])->get(["id", "program_id"]);

        if ($communityDialogues->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No community dialogue available !"
            ], 404);
        }

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $communityDialogues
        ]);
    }

    public function indexBeneficirySessions(Request $request, string $id)
    {
        $beneficiary = Beneficiary::find($id);

        if (!$beneficiary) {
            return response()->json([
                "status" => false,
                "message" => "No such beneficiary in system !",
                "data" => []
            ], 404);
        }

        $query = $beneficiary->cdSessions();

        if ($request->filled("type")) {
            $query->where("type", "like", "%$request->type%");
        }

        if ($request->filled("date")) {
            $query->whereDate("date", "like", "%$request->date%");
        }

        if ($search = request("search")) {
            $query->where("topic", "like", "%{$search}%");
        }

        $sessions = $query->paginate(10);

        if ($sessions->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No session was found for current beneficiary !",
                "data" => []
            ], 200);
        }

        $sessions->getCollection()->transform(function ($session) {
            $session->isPresent = (bool) $session->pivot->isPresent;

            unset($session->pivot, $session->community_dialogue_id);

            return $session;
        });

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $sessions
        ], 200);
    }

    public function indexCdSessions (Request $request, string $id)
    {
        $communityDialogue = CommunityDialogue::find($id);

        if (!$communityDialogue) return response()->json(["status" => false, "message" => "No such community dialogue in system !"], 404);

        $query = $communityDialogue->sessions();


        if ($request->filled("type")) {

            $query->where("type", "like", "%" . $request->type . "%");

        }

        if ($request->filled("date")) {

            $query->where("date", "like", "%" . $request->date . "%");

        }

        if ($search = request("search")) {

            $query->where("topic", "like", "%" . $search . "%");

        }

        $perPage = $request->integer("perPage", 10);
        $order = $request->str("order", "desc");

        $sessions = $query->orderBy("created_at", $order)->paginate($perPage);

        if ($sessions->isEmpty()) return response()->json(["status" => false, "message" => "No sessions was found for current community dialogue !", "data" => []], 200);

        $sessions->map(function ($session) {
            unset($session["community_dialogue_id"]);

            return $session;
        });

        return response()->json(["status" => true, "message" => "" , "data" => $sessions]);
    }

    public function indexCommunityDialogueGroupBeneficiaries (Request $request, string $id)
    {

        $group = Group::find($id);

        if (!$group) return response()->json(["status" => false, "message" => "No such group in system !"], 404);

        $query = $group->beneficiaries()->with(['programs.project', 'indicators']);


        if ($request->filled('projectCode') || $request->filled('focalPoint') || $request->filled('province')) {

                $query->whereHas('programs', function($q) use ($request) {
                if ($request->filled('projectCode')) {
                    $q->whereHas('project', function($q2) use ($request) {
                        $q2->where('projectCode', 'like', '%' . $request->projectCode . '%');
                    });
                }

                if ($request->filled('focalPoint')) {
                    $q->where('focalPoint', $request->focalPoint);
                }

                if ($request->filled('province')) {
                    $q->whereHas("province", function ($q2) use ($request) {
                        $q2->where("name", $request->province);
                    });
                }

            });

        }

        if ($request->filled('dateOfRegistration')) {
            $query->where('dateOfRegistration', $request->dateOfRegistration);
        }

        if ($request->filled('age')) {
            $query->where('age', $request->age);
        }

        if ($request->filled('indicator')) {
            $query->whereHas('indicators', function($q) use ($request) {
                $q->where('indicatorRef', 'like', '%' . $request->indicator . '%');
            });
        }

        if ($search = $request->input("search")) {
            $query->where(function ($q) use ($search) {
                $q->where("name", "like", "%$search%")
                    ->orWhere("fatherHusbandName", "like", "%$search%")
                    ->orWhere("code", "like", "%$search%");
            });
        }

        $perPage = $request->integer("perPage", 10);
        $order = $request->str("order", "desc");

        $beneficiaries = $query->orderBy("created_at", $order)->paginate($perPage);

        if ($beneficiaries->isEmpty()) return response()->json(["status" => false, "message" => "No beneficiaries was found for current group !", "data" => []], 200);

        return response()->json(["status" => true, "message" => "", "data" => $beneficiaries]);
    }

    public function showBeneficiary (string $id)
    {
        $beneficiary = Beneficiary::select("id", "name", "fatherHusbandName", "gender", "age", "incentiveReceived", "incentiveAmount", "jobTitle", "nationalId", "phone", "maritalStatus", "dateOfRegistration")->find($id);

        if (!$beneficiary) return response()->json(["status" => false, "message" => "No such Beneficiary in system !"], 404);

        return response()->json(["status" => true, "message" => "", "data" => $beneficiary]);
    }

    public function showCD (string $id)
    {
        $communityDialogue = CommunityDialogue::with(["program", "groups"])->find($id);

        if (!$communityDialogue) return response()->json(["status" => false, "message" => "No such community dialogue in system !"], 404);

        $communityDialogue["program"]["projectCode"] = Project::find($communityDialogue["program"]["project_id"])->projectCode;

        $communityDialogue["program"]["database"] = Database::find($communityDialogue["program"]["database_id"])->name;

        $communityDialogue["district"] = District::find($communityDialogue["program"]["district_id"])->name;

        $communityDialogue["program"]["province"] = Province::find($communityDialogue["program"]["province_id"])->name;


        unset(
            $communityDialogue["program"]["program_id"],
            $communityDialogue["program"]["project_id"],
            $communityDialogue["program"]["database_id"],
            $communityDialogue["program"]["province_id"],
            $communityDialogue["program"]["district_id"],
            $communityDialogue["program"]["created_at"],
            $communityDialogue["program"]["updated_at"],
        );

        $communityDialogue["groups"]->map(function ($group) {
            unset($group["community_dialogue_id"]);
        });

        return response()->json(["status" => true, "message" => "", "data" => $communityDialogue]);

    }

    public function showCommunityDialogue(string $id)
    {
        $communityDialogue = CommunityDialogue::with(['program', 'sessions', 'groups'])
            ->find($id);

        if (!$communityDialogue) {
            return response()->json([
                "status" => false,
                "message" => "Community dialogue not found!"
            ], 404);
        }

        $communityDialogue->program->indicator_id = $communityDialogue->indicator_id;
        $communityDialogue->program->cdName = $communityDialogue->name;

        $programInformation = [];

        $programInformation["database"] = Database::find($communityDialogue->program->database_id)->name;

        $finalData = [
                "programInformation" => $communityDialogue->program,
                "sessions" => $communityDialogue->sessions,
                "groups" => $communityDialogue->groups,
                "remark" => $communityDialogue->remark,
        ];

        return response()->json([
            "status" => true,
            "data" => $finalData
        ], 200);
    }

    public function storeBeneficiary (StoreCdDatabaseBeneficiary $request)
    {
        $communityDialogueDb = Database::where("name", "cd_database")->first();

        if (!$communityDialogueDb) 
            return response()->json(["status" => false, "message" => "Community dialogue is not a valid database !"], 404);

        $communityDialogueDbId = $communityDialogueDb->id;

        $data = $request->all();

        $data["aprIncluded"] = true;

        $beneficiary = Beneficiary::create($data);

        DatabaseProgramBeneficiary::create([
            "database_id" => $communityDialogueDbId,
            "beneficiary_id" => $beneficiary->id
        ]);

        return response()->json(["status" => true, "message" => "Beneficiary successfully created !"], 200);
        
    }

    public function storeCommunityDialogue (StoreCommunityDialogueRequest $request)
    {
        $communityDialogueDatabase = Database::where("name", "cd_database")->first();

        if (!$communityDialogueDatabase) return response()->json(["status" => false, "message" => "Community dialogue is not a valid database !"], 422);

        $programInformation = $request->input("programInformation");

        $communityDialogueIndicator = Indicator::find($programInformation["indicator_id"]);

        // temprory
        $programInformation["siteCode"] = "200";
        $programInformation["healthFacilityName"] = "200";
        $programInformation["interventionModality"] = "200";
        // temprory
        $programInformation["database_id"] = $communityDialogueDatabase->id;

        $cdName = $programInformation["cdName"];

        unset($programInformation["cdName"]);

        $program = Program::create($programInformation);

        $communityDialogue = CommunityDialogue::create([
            "program_id" => $program->id,
            "indicator_id" => $communityDialogueIndicator->id,
            "name" => $cdName,
            "remark" => $request->remark ?? ""
        ]);

        $sessions = $request->input("sessions");

        if ($sessions) {
            foreach($sessions as $session) {
                $communityDialogue->sessions()->create($session);
            }
        }

        $groups = $request->input("groups");

        if ($groups) {
            foreach ($groups as $group) {
                $communityDialogue->groups()->create($group);
            }
        }

        return response()->json(["status" => true, "message" => "Community dialogue successfully created !"], 200);

    }

    public function createNewGroup (Request $request, string $id)
    {

        $communityDialogue = CommunityDialogue::find($id);

        if (!$communityDialogue) return response()->json(["status" => false, "message" => "No such community dialogue in system !", "data" => []], 404);

        $validated = $request->validate(
            [
                "name" => "required|string|min:3"
            ]
        );

        $communityDialogue->groups()->create($validated);

        return response()->json(["status" => true, "message" => "Group successfully created !", "data" => []], 200);

    }


    public function updateBeneficiary (UpdateCdDatabaseBeneficiary $request, string $id)
    {
        $beneficiary = Beneficiary::find($id);

        if (!$beneficiary) return response()->json(["status" => false, "message" => "No such beneficiary in system !"], 404);

        $validated = $request->all();

        $beneficiary->update($validated);

        return response()->json(["status" => true, "message" => "Beneficiary successfully updated !"], 200);

    }

    public function updateCommunityDialogue(UpdateCommunityDialogueRequest $request, string $id)
    {
        $communityDialogue = CommunityDialogue::find($id);

        if (!$communityDialogue) {
            return response()->json([
                "status" => false,
                "message" => "Community dialogue not found!"
            ], 404);
        }

        $programInformation = $request->input("programInformation");
        $communityDialogueIndicator = Indicator::find($programInformation["indicator_id"]);

        $program = $communityDialogue->program;
        $program->update($programInformation);

        $communityDialogue->update([
            "indicator_id" => $communityDialogueIndicator->id,
            "remark" => $request->remark
        ]);

        $sessions = $request->input("sessions", []);
        $newSessions = [];
        foreach ($sessions as $session) {            
            if ($session['id']) {
                $sessionFromDb = CommunityDialogueSession::find($session["id"]);
                if (!$sessionFromDb) continue;
                unset($session["id"]);
                $sessionFromDb->update($session);
                continue;
            }
            unset($session["id"]);
            $createdSession = $communityDialogue->sessions()->create($session);
            array_push($newSessions, $createdSession);
        }

        $communityDialogueBeneficiaries = $communityDialogue->beneficiaries()->get();
        $communityDialogueSessionsIds = $communityDialogue->sessions()->pluck("id");

        foreach ($communityDialogueBeneficiaries as $bnf) {
            $bnf->communityDialogueSessions()->sync($communityDialogueSessionsIds);
        }

        $groups = $request->input("groups", []);
        foreach ($groups as $group) {
            if ($group['id']) {
                $groupFromDb = Group::find($group['id']);
                if (!$groupFromDb) continue;
                unset($group['id']);
                $groupFromDb->update($group);
                continue;
            }
            $communityDialogue->groups()->create($group);
        }

        return response()->json([
            "status" => true,
            "message" => "Community dialogue successfully updated!"
        ], 200);
    }

    public function destroyBeneficiaries (Request $request)
    {
        $ids = $request->input("ids");

        $request->validate([
            "ids" => "required|array",
            "ids.*" => "integer"
        ]);

        Beneficiary::whereIn("id", $ids)->delete();

        return response()->json(["status" => true, "message" => "Beneficiaries successfully deleted !"], 200);
    }

    public function destroyCommunityDialogue (Request $request)
    {
        
        $request->validate([
            "ids" => "required|array",
            "ids.*" => "integer"
        ]);
        
        $ids = $request->input("ids");

        CommunityDialogue::whereIn("id", $ids)->delete();

        return response()->json(["status" => true, "message" => "Community dialogues successfully deleted !"], 200);
    }

    public function destroyBeneficiarySessions (Request $request, string $id)
    {

        $beneficiary = Beneficiary::find($id);

        if (!$beneficiary) return response()->json(["status" => false, "message" => "No such beneficiary in system !"], 404);

        $ids = $request->input("ids");

        $beneficiary->cdSessions()->whereIn('community_dialogue_session_id', $ids)->forceDelete();

        return response()->json(["status" => true, "message" => "Sessions successfully removed !"], 200);

    }

    public function destroySessions(Request $request) 
    {

        $request->validate([
            "ids" => "required|array",
            "ids.*" => "integer"
        ]);
        
        $ids = $request->input("ids");

        CommunityDialogueSession::whereIn("id", $ids)->delete();

        return response()->json(["status" => true, "message" => "Selected sessions successfully deleted !"], 200);

    }

    public function destroyGroup (string $id) 
    {

        $group = Group::find($id);

        if (!$group) return response()->json(["status" => false, "message" => "No such group in system !", "data" => []], 404);

        $groupBeneficiaries = $group->beneficiaries;

        foreach ($groupBeneficiaries as $bnf) {

            $bnf->cdSessions()->sync([]);

        }

        $group->forceDelete();

        return response()->json(["status" => true, "message" => "Group successfully deleted !", "data" => []], 200);

    }

    public function addCommunityDialogueToBeneficiaries(Request $request)
    {
        $beneficiaryIds = $request->input("ids");
        $communityDialogueInput = $request->input("communityDialogue");

        if (empty($beneficiaryIds) || empty($communityDialogueInput) || !isset($communityDialogueInput[0])) {
            return response()->json([
                "status" => false,
                "message" => "Invalid input!"
            ], 400);
        }

        $groupId = $communityDialogueInput[0]["group"]["id"];
        $communityDialogueId = $communityDialogueInput[0]["communityDialogueId"];

        $beneficiaries = Beneficiary::whereIn("id", $beneficiaryIds)->get();

        if ($beneficiaries->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No such beneficiaries in system!"
            ], 404);
        }

        $communityDialogue = CommunityDialogue::find($communityDialogueId);

        if (!$communityDialogue) {
            return response()->json([
                "status" => false,
                "message" => "No such community dialogue in system!"
            ]);
        }

        $communityDialogueSessionIds = CommunityDialogueSession::where("community_dialogue_id", $communityDialogueId)
                            ->pluck("id")
                            ->toArray();

        DB::transaction(function () use ($beneficiaries, $communityDialogue, $communityDialogueSessionIds, $groupId) {
            foreach ($beneficiaries as $beneficiary) {
                foreach ($communityDialogueSessionIds as $sessionId) {
                    BeneficiaryCommunityDialogueSession::firstOrCreate(
                        [
                            "beneficiary_id" => $beneficiary->id,
                            "community_dialogue_session_id" => $sessionId
                        ],
                        ["isPresent" => true]
                    );
                }

                $beneficiary->groups()->syncWithoutDetaching([
                    $groupId => ['updated_at' => now()]
                ]);

                $beneficiary->indicators()->syncWithoutDetaching([
                    $communityDialogue->indicator_id => ["updated_at" => now()]
                ]);

                DatabaseProgramBeneficiary::updateOrCreate([
                    "database_id" => Database::where("name", "cd_database")->first()->id,
                    "beneficiary_id" => $beneficiary->id,
                    "program_id" => null
                ],[
                    "database_id" => Database::where("name", "cd_database")->first()->id,
                    "program_id" => $communityDialogue->program_id,
                    "beneficiary_id" => $beneficiary->id
                ]);
            }
        });

        return response()->json([
            "status" => true,
            "message" => "Beneficiaries successfully added to the community dialogue!"
        ]);
    }

    public function createNewSession(Request $request)
    {

        $validated = $request->validate([
            "community_dialogue_id" => "required",
            "topic" => "required|string|min:3",
            "date" => "required|date"
        ]);

        $cd = CommunityDialogue::find($validated["community_dialogue_id"]);

        if (!$cd) return response()->json(["status" => false, "message" => "No such community dialogue in system !", "data" => []], 404);


        $numOfCdSessions = $cd->sessions()->count();

        if ($numOfCdSessions >= 1) $validated["type"] = "followUp";
        else $validated["type"] = "initial";

        $createdSession = CommunityDialogueSession::create($validated);


        $beneficiaryIds = $cd->sessions()
                            ->with('beneficiaries')
                            ->get()
                            ->flatMap(fn ($s) => $s->beneficiaries)
                            ->unique('id')
                            ->pluck('id')
                            ->toArray();


        AttachBeneficiariesToSession::dispatch(
            $createdSession->id,
            $beneficiaryIds,
            Auth::id()
        );

        return response()->json([
            "status"  => true,
            "message" => "The new session has been successfully created. The system is now attaching all participants to the session. You will be notified as soon as this process is completed."
        ], 200);

    }

    public function showSession(string $id)
    {
        $session = CommunityDialogueSession::find($id);

        if (!$session) {
            return response()->json([
                "status" => false,
                "message" => "Session not found!"
            ], 404);
        }

        return response()->json([
            "status" => true,
            "data" => $session
        ], 200);
    }

    public function updateSession(Request $request, $id)
    {
        $session = CommunityDialogueSession::find($id);

        if (!$session) {
            return response()->json([
                "status" => false,
                "message" => "Session not found!"
            ], 404);
        }

        $validated = $request->validate([
            "community_dialogue_id" => "required|exists:community_dialogues,id",
            "topic" => "required|string|min:3",
            "date" => "required|date"
        ]);

        $exists = CommunityDialogueSession::where("community_dialogue_id", $validated["community_dialogue_id"])
            ->where("topic", $validated["topic"])
            ->where("date", $validated["date"])
            ->where("id", "!=", $session->id)
            ->exists();

        if ($exists) {
            return response()->json([
                "status" => false,
                "message" => "A session with the same topic and date already exists for this community dialogue!"
            ], 409);
        }

        $session->update($validated);

        return response()->json([
            "status" => true,
            "message" => "Session successfully updated!",
            "data" => $session
        ], 200);
    }

    public function togglePresences (Request $request, string $id)
    {

        $request->validate([
            "selectedRows" => "required|array",
            "selectedRows.*" => "integer"
        ]);

        $beneficiary = Beneficiary::find($id);

        if (!$beneficiary) return response()->json(["status" => false, "message" => "No such beneficiary in system !"], 404);

        $sessionsIds = $request->input("selectedRows");

        $sessions = CommunityDialogueSession::whereIn("id", $sessionsIds)->get();

        if ($sessions->isEmpty())
            return response()->json(["status" => false, "message" => "No such sessions in system !"], 404);

        foreach ($sessions as $session) {

            $pivot = BeneficiaryCommunityDialogueSession::where("beneficiary_id", $beneficiary->id)->where("community_dialogue_session_id", $session->id)->first();

            $pivot->isPresent = !$pivot->isPresent;

            $pivot->save();
        }

        return response()->json(["status" => true, "message" => "Presence status successfully changed !"], 200);
    }

    public function togglePresence (string $bnfId, string $sessionId)
    {
        $beneficiary = Beneficiary::find($bnfId);

        if (!$beneficiary) return response()->json(["status" => false, "message" => "No such beneficiary in system !", "data" => []], 404);

        $session = CommunityDialogueSession::find($sessionId);

        if (!$session) return response()->json(["status" => false, "message" => "No such session in system !", "data" => []], 200);

        $pivot = BeneficiaryCommunityDialogueSession::where("beneficiary_id", $beneficiary->id)->where("community_dialogue_session_id", $session->id)->first();

        $pivot->isPresent = !$pivot->isPresent;

        $pivot->save();

        $newPresenceStatus = $pivot->isPresent ? "Present" : "Absences";

        return response()->json(["status" => true, "message" => "Presence status successfully changed to " . $newPresenceStatus, "data" => []], 200);
    }

    public function removeBeneficiariesFromGroup(Request $request, string $id)
    {
        $group = Group::find($id);

        if (!$group) {
            return response()->json([
                "status" => false,
                "message" => "No such group in system!",
                "data" => []
            ], 404);
        }

        $request->validate([
            "ids" => "required|array",
            "ids.*" => "integer"
        ]);

        $beneficiaries = $group->beneficiaries()
            ->whereIn("beneficiary_id", $request->ids)
            ->get();

        $cdGroupIds = $group->communityDialogue
            ->groups()
            ->pluck("id")
            ->toArray();

        $cdSessionIds = $group->communityDialogue
            ->sessions()
            ->pluck("community_dialogue_sessions.id")
            ->toArray();

        foreach ($beneficiaries as $bnf) {

            $bnf->groups()->detach($group->id);

            $stillInCd = $bnf->groups()
                ->whereIn("groups.id", $cdGroupIds)
                ->exists();

            if (!$stillInCd) {
                $bnf->cdSessions()->detach($cdSessionIds);
            }
        }

        return response()->json([
            "status" => true,
            "message" => "Selected beneficiaries successfully removed!",
            "data" => []
        ]);
    }

    public function removeBeneficiariesFromCd (Request $request, string $id) 
    {

        $communityDialogue = CommunityDialogue::find($id);

        if (!$communityDialogue) return response()->json(["status" => false, "message" => "No such community dialogue in system !"], 404);

        $communityDialogue->beneficiaries()->whereIn("id", $request->input("ids"))->delete();

        return response()->json(["status" => true, "message" => "Selected beneficiaries successfully removed !"], 200);

    }

    public function removeBeneficiaryFromCd (string $id) 
    {

        $beneficiary = Beneficiary::find($id);

        if (!$beneficiary) return response()->json(["status" => false, "message" => "No such beneficiary in system !"], 404);

    }

}

