<?php

namespace App\Http\Controllers;

use App\Models\Beneficiary;
use App\Models\Project;
use App\Models\Database;
use App\Models\Program;
use App\Models\Psychoeducations;
use App\Models\Indicator;
use App\Models\Training;
use App\Models\Province;
use App\Models\District;
use App\Models\Apr;
use App\Models\Kit;
use App\Models\Enact;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use App\Models\CommunityDialogue;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function projects (Request $request) {

        $query = Project::query();

        $query->where('projectCode', 'like', '%' . $request->input . '%');

        $projects = $query->paginate(10);

        if ($projects->isEmpty()) return response()->json(["status" => false, "message" => "No such project in system !"], 404);

        return response()->json(["status" => true, "message" => "", "data" => $projects], 200);

    }

    public function mainDbBeneficiaries (Request $request) {

        $mainDatabaseId = Database::where('name', 'main_database')->value('id');

        if (!$mainDatabaseId) {
            return response()->json([
                "status" => false,
                "message" => "Main database not found",
                "data" => [],
            ], 404);
        }

        $query = Beneficiary::query()
            ->with(['programs.project', 'indicators', 'mealTools']);

        $query->whereHas('programs', function($q) use ($request, $mainDatabaseId) {
        $q->where('database_program_beneficiary.database_id', $mainDatabaseId);});

        $query->where(function ($q) use ($request) {
            $q->where('name', 'like', '%' . $request->input . '%')
                ->orWhere('fatherHusbandName', 'like', '%' . $request->input . '%')
                ->orWhere('code', 'like', '%' . $request->input . '%');
        });

        $beneficiaries = $query->paginate(10);

        if ($beneficiaries->isEmpty()) return response()->json(["status" => false, "message" => "No such beneficiary in system !"], 404);

        return response()->json(["status" => true, "message" => "", "data" => $beneficiaries], 200);

    }

    public function mainDbProgram (Request $request) {

        $mainDatabaseId = Database::where('name', 'main_database')->value('id');

        if (!$mainDatabaseId) {
            return response()->json([
                "status" => false,
                "message" => "Main database not found",
                "data" => [],
            ], 404);
        }

        $programs = Program::with(["project:id,projectCode", "province:id,name", "district:id,name", "database:id,name"])->where("database_id", $mainDatabaseId)->where('name', 'like', '%' . $request->input . '%')->paginate(10)->map(function ($program) {
            return [
                "id" => $program->id,
                "database" => $program->database?->name,
                "name" => $program->name,
                "province" => $program->province?->name,
                "district" => $program->district?->name,
                "projectCode" => $program->project?->projectCode,
                "focalPoint" => $program->focalPoint,
                "village" => $program->village,
                "siteCode" => $program->siteCode,
                "healthFacilityName" => $program->healthFacilityName,
                "interventionModality" => $program->interventionModality
            ];
        });


        if ($programs->isEmpty()) return response()->json(["status" => false, "message" => "No such program in system !"], 404);        

        return response()->json(["status" => true, "message" => "", "data" => $programs], 200);

    }

    public function kitDbBeneficiaries (Request $request) {

        $kitDatabaseId = Database::where('name', 'kit_database')->value('id');

        if (!$kitDatabaseId) {
            return response()->json([
                "status" => false,
                "message" => "Kit database not found",
                "data" => [],
            ], 404);
        }

        $query = Beneficiary::query()
            ->with(['programs.project', 'indicators']);

        $query->whereHas('programs', function($q) use ($kitDatabaseId) {
            $q->where('database_program_beneficiary.database_id', $kitDatabaseId);
        });

        $query->where(function ($q) use ($request) {
            $q->where('name', 'like', '%' . $request->input . '%')
                ->orWhere('fatherHusbandName', 'like', '%' . $request->input . '%')
                ->orWhere('code', 'like', '%' . $request->input . '%');
        });

        $beneficiaries = $query->paginate(10);

        if ($beneficiaries->isEmpty()) return response()->json(["status" => false, "message" => "No such beneficiary in system !"], 404);

        return response()->json(["status" => true, "message" => "", "data" => $beneficiaries], 200);
        
    }

    public function kitDbProgram (Request $request) {

        $kitDatabaseId = Database::where('name', 'kit_database')->value('id');

        if (!$kitDatabaseId) {
            return response()->json([
                "status" => false,
                "message" => "Kit database not found",
                "data" => [],
            ], 404);
        }

        $programs = Program::with(["project:id,projectCode", "province:id,name", "district:id,name", "database:id,name"])->where("database_id", $kitDatabaseId)->where('name', 'like', '%' . $request->input . '%')->paginate(10)->map(function ($program) {
            return [
                "id" => $program->id,
                "database" => $program->database?->name,
                "name" => $program->name,
                "province" => $program->province?->name,
                "district" => $program->district?->name,
                "projectCode" => $program->project?->projectCode,
                "focalPoint" => $program->focalPoint,
                "village" => $program->village,
                "siteCode" => $program->siteCode,
                "healthFacilityName" => $program->healthFacilityName,
                "interventionModality" => $program->interventionModality
            ];
        });


        if ($programs->isEmpty()) return response()->json(["status" => false, "message" => "No such program in system !"], 404);        

        return response()->json(["status" => true, "message" => "", "data" => $programs], 200);

    }

    public function kitDbKits (Request $request) {

        $query = Kit::query();

        $query->where(function ($q) use ($request) {
            $q->where("name", "like", "%" . $request->input . "%")
                ->orWhere("fatherHusbandName", "like", "%" . $request->input . "%")
                ->orWhere("code", "like", "%" . $request->input . "%");
        });

        $kits = $query->paginate(10);

        if ($kits->isEmpty()) return response()->json(["status" => false, "message" => "No kit was found for requested name !"], 404);

        $kits = $kits->map(function ($kit) {

            unset($kit->created_at, $kit->updated_at, $kit->deleted_at);

            return $kit;

        });

        return response()->json(["status" => true, "message" => "", "data" => $kits], 200);

    }

    public function psychoeducation (Request $request) {

        $psychoeducationDatabaseID = Database::where('name', 'psychoeducation_database')->value('id');

        if (!$psychoeducationDatabaseID) {
            return response()->json([
                "status" => false,
                "message" => "psychoeducation database not found",
                "data" => [],
            ], 404);
        }

        $query = Psychoeducations::with(['program.project', 'program.province', 'program.district'])
            ->whereHas('program', function ($q) use ($psychoeducationDatabaseID, $request) {
                $q->where('database_id', $psychoeducationDatabaseID);
        });

        $query->where('awarenessTopic', "like", "%" . $request->input . "%");

        $psychoeducations = $query->paginate(10);

        if ($psychoeducations->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No psychoeducation records found",
                "data" => [],
            ], 404);
        }

        $indicatorRefs = Indicator::pluck('indicatorRef', 'id');

        $psychoeducations = $psychoeducations->map(function ($p) use ($indicatorRefs) {
            return [
                'id' => $p->id,
                'programName' => $p->program->name ?? null,
                'indicator' => $indicatorRefs[$p->indicator_id] ?? null,
                'awarenessDate' => $p->awarenessDate,
                'awarenessTopic' => $p->awarenessTopic,
            ];
        })->values();

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $psychoeducations,
        ]);

    }

    public function cdDbBeneficiaries (Request $request) {

        $cdDatabaseID = Database::where('name', 'cd_database')->value('id');

        if (!$cdDatabaseID) {
            return response()->json([
                "status" => false,
                "message" => "Community dialogue database not found",
                "data" => [],
            ], 404);
        }

        $query = Beneficiary::query()
            ->with(['programs.project', 'indicators']);

        $query->whereHas('programs', function($q) use ($request, $cdDatabaseID) {
            $q->where('database_program_beneficiary.database_id', $cdDatabaseID);
        });

        $query->where("name", "like", "%" . $request->input . "%");

        $beneficiaries = $query->paginate(10);

        if ($beneficiaries->isEmpty()) return response()->json(["status" => false, "message" => "No such beneficiary was found !"], 404);

        return response()->json(["status" => true, "message" => "", "data" => $beneficiaries], 200);

    }

    public function cdDbCds (Request $request) {

        $query = CommunityDialogue::query()->with([
            'program.project',
            'program.province',
            'indicator'
        ]);


        $query->whereHas('program.project', function ($q) use ($request) {
            $q->where('projectCode', 'like', '%' . $request->input . '%');
        });

        $cds = $query->paginate(10);

        if ($cds->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No community dialogue records found  !",
                "data" => [],
            ], 404);
        }

        $cds = $cds->map(function ($cd) {
            return [
                'id' => $cd->id,
                'projectCode' => $cd->program->project->projectCode ?? null,
                'focalPoint' => $cd->program->focalPoint ?? null,
                'province' => $cd->program->province->name ?? null,
                'indicator' => $cd->indicator->indicatorRef ?? null,
                'remark' => $cd->remark,
                'numOfSessions' => $cd->sessions->count(),
                'numOfGroups' => $cd->groups->count(),
                'village' => $cd->program->village,
                'district' => $cd->program->district->name,
            ];
        })->values();

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $cds,
        ]);

    }

    public function cdSession (Request $request) {}

    public function trainingDbBeneficiary (Request $request) {

        $trainingDB = Database::where("name", "training_database")->first();

        if (!$trainingDB) return response()->json(["status" => false, "message" => "Training database is not a valid database"], 404);

        $beneficiaries = $trainingDB->beneficiaries()
            ->where(function ($q) use ($request) {
                $q->where("name", "like", "%" . $request->input . "%")
                    ->orWhere("fatherHusbandName", "like", "%" . $request->input . "%")
                    ->orWhere("code", "like", "%" . $request->input . "%");
            })
            ->paginate(10);

        if ($beneficiaries->isEmpty()) return response()->json(["status" => false, "message" => "No such beneficiary in system !"], 404);

        return response()->json(["status" => true, "message" => "", "data" => $beneficiaries]);
        
    }

    public function trainings (Request $request) {

        $query = Training::query();

        $query->whereHas("project", function ($q) use ($request) {
            $q->where("projectCode", "like", "%" . $request->input . "%");
        });

        $trainings = $query->paginate(10);

        if ($trainings->isEmpty()) {

            return response()->json([
                "status" => false,
                "message" => "No training was found for requested project code !",
                "data" => []
            ], 404);
        }

        $trainings = $trainings->map(function ($training) {
            $training["projectCode"] = Project::find($training->project_id)->projectCode;
            $training["province"] = Province::find($training->province_id)->name;
            $training["indicator"] = Indicator::find($training->indicator_id)->indicator;
            $training["district"] = District::find($training->district_id)->name;

            unset($training["project_id"]);
            unset($training["province_id"]);
            unset($training["indicator_id"]);
            unset($training["district_id"]);

            return $training;
        });

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $trainings
        ]);

    }

    public function referalDbBeneficiary (Request $request) {

        $query = Beneficiary::query()->whereHas("referral");

        $query->where(function ($q) use ($request) {
            $q->where("name", "like", "%" . $request->input . "%")
                ->orWhere("fatherHusbandName", "like", "%" . $request->input . "%")
                ->orWhere("code", "like", "%" . $request->input . "%");
        });

        $beneficiaries = $query->paginate(10);

        if ($beneficiaries->isEmpty())
            return response()->json(["status" => false, "message" => "No such beneficiary in system !"], 404);

        return response()->json(["status" => true, "message" => "", "data" => $beneficiaries]);

    }

    public function assessments (Request $request) {

        $query = Enact::query();

        $query->whereHas("project", function ($q) use ($request) {
            $q->where("projectCode", "like", "%" . $request->input . "%");
        });

        $enacts = $query->paginate(10);

        if ($enacts->isEmpty())
            return response()->json([
                "status" => false,
                "message" => "No assessmensts was found for requested project code !",
                "data" => [],
            ]);

        $enacts->map(function ($enact) {
            $enact["projectCode"] = Project::find($enact["project_id"])->projectCode;
            $enact["province"] = Province::find($enact["province_id"])->name;
            $enact["indicatorRef"] = Indicator::find($enact["indicator_id"])->indicatorRef;

            unset($enact["project_id"], $enact["province_id"], $enact["indicator_id"]);

            return $enact;
        });

        return response()->json(["status" => true, "message" => "", "data" => $enacts]);

    }

    public function users (Request $request) {

        $query = User::query();

        $query->where("name", "like", "%" . $request->input . "%");

        $users = $query->paginate(10);

        if ($users->isEmpty())
            return response()->json([
                    "status" => false,
                    "message" => "No such user was found !",
                    "data" => [],
            ], 404);

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $users,
        ]);


    }

    public function roles (Request $request) {

        $query = Role::query();

        $query->where("name", "like", "%" . $request->name . "%");

        $roles = $query->paginate(10);

        if ($roles->isEmpty())
            return response()->json([
                "status" => false,
                "message" => "No such role in system !",
                "data" => []
            ]);

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $roles
        ]);

    }

    public function permissions (Request $request) {

        $query = Permission::query();

        $query->where("name", "like", "%" . $request->input . "%");

        $permissions = $query->paginate(10);

        if ($permissions->isEmpty())
            return response()->json([
                "status" => false,
                "message" => "No such permission in system !",
                "data" => []
            ]);

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $permissions
        ]);

    }

    public function submittedDatabase (Request $request) {

        $query = Apr::query()->where("status", "submitted")->orWhere("status", "firstRejected");

        $query->whereHas("project", function ($q) use ($request) {
            $q->where("projectCode", "like", "%" . $request->input . "%");
        });

        $aprs = $query->paginate(10);

        if ($aprs->isEmpty())
            return response()->json([
                "status" => false,
                "message" => "No submitted database was found for requested project code !",
                "data" => []
            ]);

        $aprs->map(function ($submittedDatabase) {

            $submittedDatabase["projectCode"] = Project::find($submittedDatabase["project_id"])->projectCode;
            $submittedDatabase["province"] = Province::find($submittedDatabase["province_id"])->name;
            $submittedDatabase["database"] = Database::find($submittedDatabase["database_id"])->name;

            unset($submittedDatabase["project_id"], $submittedDatabase["database_id"], $submittedDatabase["province_id"]);

            return $submittedDatabase;

        });

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $aprs
        ]);

    }

    public function ApprovedDatabase (Request $request) {

        $query = Apr::query()->where("status", "firstApproved")->orWhere("status", );

        $query->whereHas("project", function ($q) use ($request) {
            $q->where("projectCode", $request->projectCode);
        });

        $aprs = $query->paginate(10);

        if ($aprs->isEmpty())
            return response()->json([
                "status" => false,
                "message" => "No submitted database was found for applied filters !",
                "data" => []
            ]);

        $aprs->map(function ($submittedDatabase) {

            $submittedDatabase["projectCode"] = Project::find($submittedDatabase["project_id"])->projectCode;
            $submittedDatabase["province"] = Province::find($submittedDatabase["province_id"])->name;
            $submittedDatabase["database"] = Database::find($submittedDatabase["database_id"])->name;

            unset($submittedDatabase["project_id"], $submittedDatabase["database_id"], $submittedDatabase["province_id"]);

            return $submittedDatabase;

        });

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $aprs
        ]);

    }

    public function ReviewedAprs (Request $request) {

        $query = Apr::query()->where("status", "secondRejected")->orWhere("status", "firstApproved");

        $query->whereHas("project", function ($q) use ($request) {
            $q->where("projectCode", $request->projectCode);
        });


        $aprs = $query->paginate(10);

        if ($aprs->isEmpty())
            return response()->json([
                "status" => false,
                "message" => "No reviewed database was found for requested project code !",
                "data" => []
            ]);

        $aprs->map(function ($submittedDatabase) {

            $submittedDatabase["projectCode"] = Project::find($submittedDatabase["project_id"])->projectCode;
            $submittedDatabase["province"] = Province::find($submittedDatabase["province_id"])->name;
            $submittedDatabase["database"] = Database::find($submittedDatabase["database_id"])->name;

            unset($submittedDatabase["project_id"], $submittedDatabase["database_id"], $submittedDatabase["province_id"]);

            return $submittedDatabase;

        });

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $aprs
        ]);

    }

    public function ApprovedAprs (Request $request) {

         $query = Apr::query()->where("status", "reviewed")->orWhere("status", "secondApproved");

        $query->whereHas("project", function ($q) use ($request) {
            $q->where("projectCode", $request->projectCode);
        });

        $aprs = $query->paginate(10);

        if ($aprs->isEmpty())
            return response()->json([
                "status" => false,
                "message" => "No approved aprs was found for requested project code !",
                "data" => []
            ]);

        $aprs->map(function ($submittedDatabase) {

            $submittedDatabase["projectCode"] = Project::find($submittedDatabase["project_id"])->projectCode;
            $submittedDatabase["province"] = Province::find($submittedDatabase["province_id"])->name;
            $submittedDatabase["database"] = Database::find($submittedDatabase["database_id"])->name;

            unset($submittedDatabase["project_id"], $submittedDatabase["database_id"], $submittedDatabase["province_id"]);

            return $submittedDatabase;

        });

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $aprs
        ]);

    }
}
