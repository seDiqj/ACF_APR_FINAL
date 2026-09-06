<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Indicator;
use App\Models\CommunityDialogue;
use App\Models\Province;
use App\Models\Database;
use App\Models\Psychoeducations;
use App\Models\Beneficiary;
use App\Models\Training;
use App\Models\District;
use App\Models\Enact;
use App\Models\User;
use App\Models\Apr;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\Request;

class FilterTablesController extends Controller
{
    public function filterProjects(Request $request)
    {
        $query = Project::query();

        // projectCode
        if ($request->filled('projectCode')) {
            $query->where('projectCode', 'like', '%' . $request->projectCode . '%');
        }

        // projectManager
        if ($request->filled('projectManager')) {
            $query->where('projectManager', $request->projectManager);
        }

        // startDate - endDate
        if ($request->filled('startDate') && $request->filled('endDate')) {
            $query->whereBetween('startDate', [$request->startDate, $request->endDate]);
        } elseif ($request->filled('startDate')) {
            $query->where('startDate', '>=', $request->startDate);
        } elseif ($request->filled('endDate')) {
            $query->where('endDate', '<=', $request->endDate);
        }

        if ($request->filled('reportingDate')) {
            $query->where('reportingDate', $request->reportingDate);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('aprStatus')) {
            $query->where('aprStatus', $request->aprStatus);
        }

        if ($request->filled('projectTitle')) {
            $query->where('projectTitle', 'like', '%' . $request->projectTitle . '%');
        }

        if ($request->filled('projectDonor')) {
            $query->where('projectDonor', 'like', '%' . $request->projectDonor . '%');
        }

        if ($request->filled('projectGoal')) {
            $query->where('projectGoal', 'like', '%' . $request->projectGoal . '%');
        }

        $projects = $query->get();

        if ($projects->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No project available in database records",
                "data" => [],
            ], 404);
        }

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $projects,
        ]);
    }

    public function filterMainDbBnf(Request $request)
    {
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
            $q->where('database_program_beneficiary.database_id', $mainDatabaseId);

            if ($request->filled('projectCode')) {
                $q->whereHas('project', function($q2) use ($request) {
                    $q2->where('projectCode', 'like', '%' . $request->projectCode . '%');
                });
            }

            if ($request->filled('focalPoint')) {
                $q->where('focalPoint', $request->focalPoint);
            }

            if ($request->filled('province')) {
                $q->where('province_id', $request->province);
            }

            if ($request->filled('siteCode')) {
                $q->where('siteCode', $request->siteCode);
            }

            if ($request->filled('healthFacilitator')) {
                $q->where('healthFacilityName', 'like', '%' . $request->healthFacilitator . '%');
            }
        });

        if ($request->filled('dateOfRegistration')) {
            $query->where('dateOfRegistration', $request->dateOfRegistration);
        }

        if ($request->filled('age')) {
            $query->where('age', $request->age);
        }

        if ($request->filled('maritalStatus')) {
            $query->where('maritalStatus', $request->maritalStatus);
        }

        if ($request->filled('householdStatus')) {
            $query->where('householdStatus', 'like', '%' . $request->householdStatus . '%');
        }

        if ($request->filled('baselineDate')) {
            $query->whereHas('mealTools', function($q) use ($request) {
                $q->where('baselineDate', $request->baselineDate);
            });
        }

        if ($request->filled('endlineDate')) {
            $query->whereHas('mealTools', function($q) use ($request) {
                $q->where('endlineDate', $request->endlineDate);
            });
        }

        if ($request->filled('indicator')) {
            $query->whereHas('indicators', function($q) use ($request) {
                $q->where('indicator', 'like', '%' . $request->indicator . '%');
            });
        }

        $beneficiaries = $query->get();

        if ($beneficiaries->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No beneficiary found in database records",
                "data" => [],
            ], 404);
        }

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $beneficiaries,
        ]);
    }

    public function filterMainDbPrograms(Request $request)
    {
        $mainDatabaseId = \App\Models\Database::where('name', 'main_database')->value('id');

        if (!$mainDatabaseId) {
            return response()->json([
                "status" => false,
                "message" => "Main database not found",
                "data" => [],
            ], 404);
        }

        $query = \App\Models\Program::query()
            ->with(['project']);


        if ($search = request("search")) {
            $query->where('name', 'like', '%' . $search . '%');
        };

        $query->where('database_id', $mainDatabaseId);

        if ($request->filled('projectCode')) {
            $query->whereHas('project', function($q) use ($request) {
                $q->where('projectCode', 'like', '%' . $request->projectCode . '%');
            });
        }

        if ($request->filled('focalPoint')) {
            $query->where('focalPoint', $request->focalPoint);
        }

        if ($request->filled('province')) {
            $provinceId = \App\Models\Province::where('name', $request->province)->value('id');
            if ($provinceId) {
                $query->where('province_id', $provinceId);
            }
        }

        if ($request->filled('district')) {
            $districtId = \App\Models\District::where('name', $request->district)->value('id');
            if ($districtId) {
                $query->where('district_id', $districtId);
            }
        }

        if ($request->filled('village')) {
            $query->where('village', 'like', '%' . $request->village . '%');
        }

        if ($request->filled('siteCode')) {
            $query->where('siteCode', $request->siteCode);
        }

        if ($request->filled('healthFacilityName')) {
            $query->where('healthFacilityName', 'like', '%' . $request->healthFacilityName . '%');
        }

        if ($request->filled('interventionModality')) {
            $query->where('interventionModality', 'like', '%' . $request->interventionModality . '%');
        }

        $programs = $query->get();

        if ($programs->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No program found in database records",
                "data" => [],
            ], 404);
        }

        $programs = $programs->map(function ($program) {
            return [
                "id" => $program->id,
                "database" => $program->database->name,
                "province" => $program->province->name,
                "district" => $program->district->name,
                "projectCode" => $program->project->projectCode,
                "focalPoint" => $program->focalPoint,
                "village" => $program->village,
                "siteCode" => $program->siteCode,
                "healthFacilityName" => $program->healthFacilityName,
                "interventionModality" => $program->interventionModality
            ];
        });

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $programs,
        ]);
    }

    public function filterKitDbPrograms(Request $request)
    {
        $kitDatabaseId = \App\Models\Database::where('name', 'kit_database')->value('id');

        if (!$kitDatabaseId) {
            return response()->json([
                "status" => false,
                "message" => "Kit database not found",
                "data" => [],
            ], 404);
        }

        $query = \App\Models\Program::query()
            ->with(['project']);

        $query->where('database_id', $kitDatabaseId);

        if ($request->filled('projectCode')) {
            $query->whereHas('project', function($q) use ($request) {
                $q->where('projectCode', 'like', '%' . $request->projectCode . '%');
            });
        }

        if ($request->filled('focalPoint')) {
            $query->where('focalPoint', $request->focalPoint);
        }

        if ($request->filled('province')) {
            $provinceId = \App\Models\Province::where('name', $request->province)->value('id');
            if ($provinceId) {
                $query->where('province_id', $provinceId);
            }
        }

        if ($request->filled('district')) {
            $districtId = \App\Models\District::where('name', $request->district)->value('id');
            if ($districtId) {
                $query->where('district_id', $districtId);
            }
        }


        if ($request->filled('village')) {
            $query->where('village', 'like', '%' . $request->village . '%');
        }

        if ($request->filled('siteCode')) {
            $query->where('siteCode', $request->siteCode);
        }

        if ($request->filled('healthFacilityName')) {
            $query->where('healthFacilityName', 'like', '%' . $request->healthFacilityName . '%');
        }

        if ($request->filled('interventionModality')) {
            $query->where('interventionModality', 'like', '%' . $request->interventionModality . '%');
        }

        // اجرای query
        $programs = $query->get();

        if ($programs->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No program found in database records",
                "data" => [],
            ], 404);
        }

        $programs = $programs->map(function ($program) {
            return [
                "id" => $program->id,
                "database" => $program->database->name,
                "province" => $program->province->name,
                "district" => $program->district->name,
                "projectCode" => $program->project->projectCode,
                "focalPoint" => $program->focalPoint,
                "village" => $program->village,
                "siteCode" => $program->siteCode,
                "healthFacilityName" => $program->healthFacilityName,
                "interventionModality" => $program->interventionModality
            ];
        });

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $programs,
        ]);
    }

    public function filterPsychoeducations(Request $request)
    {
        $psychoeducationDatabaseID = Database::where('name', 'psychoeducation_database')->value('id');

        if (!$psychoeducationDatabaseID) {
            return response()->json([
                "status" => false,
                "message" => "psychoeducation database not found",
                "data" => [],
            ], 404);
        }

        $query = Psychoeducations::query()
        ->with([
            'program' => function ($q) use ($psychoeducationDatabaseID, $request) {
                $q->where('database_id', $psychoeducationDatabaseID)
                ->with(['project', 'province', 'district'])

                ->when($request->filled('projectCode'),
                    fn ($x) => $x->whereHas('project',
                        fn ($p) => $p->where('projectCode', 'like', "%{$request->projectCode}%")
                    )
                )

                ->when($request->filled('focalPoint'),
                    fn ($x) => $x->where('focalPoint', $request->focalPoint)
                )

                ->when($request->filled('province'),
                    fn ($x) => $x->whereHas('province',
                        fn ($p) => $p->where('name', $request->province)
                    )
                )

                ->when($request->filled('siteCode'),
                    fn ($x) => $x->where('siteCode', $request->siteCode)
                )

                ->when($request->filled('healthFacilityName'),
                    fn ($x) => $x->where('healthFacilityName', 'like', "%{$request->healthFacilityName}%")
                )

                ->when($request->filled('interventionModality'),
                    fn ($x) => $x->where('interventionModality', 'like', "%{$request->interventionModality}%")
                );
            }
        ])
        ->whereHas('program', fn ($q) =>
            $q->where('database_id', $psychoeducationDatabaseID)
        );


        if ($request->filled('indicator')) {
            $indicatorIds = Indicator::where('indicatorRef', 'like', '%' . $request->indicator . '%')->pluck('id');
            $query->whereIn('indicator_id', $indicatorIds);
        }

        if ($request->filled('awarenessDate')) $query->where('awarenessDate', $request->awarenessDate);

        $psychoeducations = $query->get();

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

    public function filterCdDbBnf(Request $request)
    {
        $cdDatabaseID = \App\Models\Database::where('name', 'cd_database')->value('id');

        if (!$cdDatabaseID) {
            return response()->json([
                "status" => false,
                "message" => "Community dialogue database not found",
                "data" => [],
            ], 404);
        }

        $query = \App\Models\Beneficiary::query()
            ->with(['programs.project', 'indicators']);

        $query->whereHas('programs', function($q) use ($request, $cdDatabaseID) {
            $q->where('database_program_beneficiary.database_id', $cdDatabaseID);

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

        $beneficiaries = $query->get();

        if ($beneficiaries->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No beneficiary found in database records",
                "data" => [],
            ], 404);
        }

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $beneficiaries,
        ]);
    }

    public function filterCds(Request $request)
    {
        $query = CommunityDialogue::query()->with([
            'program.project',
            'program.province',
            'indicator'
        ]);

        if ($request->filled('projectCode')) {
            $query->whereHas('program.project', function ($q) use ($request) {
                $q->where('projectCode', 'like', '%' . $request->projectCode . '%');
            });
        }

        if ($request->filled('focalPoint')) {
            $query->whereHas('program', function ($q) use ($request) {
                $q->where('focalPoint', 'like', '%' . $request->focalPoint . '%');
            });
        }

        if ($request->filled('province')) {
            $query->whereHas('program', function ($q) use ($request) {
                $q->whereHas("province", function ($q2) use ($request) {
                    $q2->where("name", $request->province);
                });
            });
        }

        if ($request->filled('indicator')) {

            if (!empty($indicatorIds)) {
                $query->whereHas('indicator', function ($q) use ($request) {
                    $q->where("indicatorRef", $request->indicator);
                });
            }
        }

        $cds = $query->get();

        if ($cds->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No community dialogue records found for applied filters !",
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

    public function filterTrainings (Request $request)
    {
        $query = Training::query();

        if ($request->filled("projectCode"))
            $query->whereHas("project", function ($q) use ($request) {
                $q->where("projectCode", $request->projectCode);
        });

        if ($request->filled("indicatorRef"))
                $query->whereHas("indicator", function ($q) use ($request) {
                    $q->where("indicatorRef", $request->indicatorRef);
                });

        if ($request->filled("province"))
            $query->whereHas("province", function ($q) use ($request) {
                $q->where("name", $request->province);
            });

        $trainings = $query->get();

        if ($trainings->isEmpty()) {

            return response()->json([
                "status" => false,
                "message" => "No trainings was found for applied filters",
                "data" => []
            ]);
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

    public function filterTrainingDatabaseBnf (Request $request)
    {

        $query = Beneficiary::query()
            ->with(['trainings']);
        
        
        $query->whereHas('trainings', function($q) use ($request) {

            if ($request->filled('projectCode')) {
                $q->whereHas('project', function($q2) use ($request) {
                    $q2->where('projectCode', 'like', '%' . $request->projectCode . '%');
                });
            }

            if ($request->filled('province')) {
                $q->whereHas('province', function ($q) use ($request) {
                    $q->where("name", "like", "%" . $request->province . "%");
                });
            }

            if ($request->filled('indicator')) {
                $q->whereHas("indicator", function ($q) use ($request) {
                    $q->where("indicatorRef", "like", "%" . $request->indicator . "%");
                });
            }

        });

        if ($request->filled('dateOfRegistration')) {
            $query->where('dateOfRegistration', $request->dateOfRegistration);
        }

        if ($request->filled('age')) {
            $query->where('age', $request->age);
        }

        if ($request->filled('gender')){
            $query->where("age", $request->age);
        }

        $beneficiaries = $query->get();

        if ($beneficiaries->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No beneficiary found in database records",
                "data" => [],
            ], 404);
        }

         return response()->json([
            "status" => true,
            "message" => "",
            "data" => $beneficiaries,
        ]);
    }

    public function filterRereralDatabaseBnf (Request $request)
    {
        $query = Beneficiary::query()->whereHas("referral");

        if ($request->filled("age")) 
            $query->where("age", $request->age);
        

        if ($request->filled("gender")) 
            $query->where("gender", $request->gender);

        if ($request->filled("dateOfRegistration"))
            $query->where("dateOfRegistration", $request->dateOfRegistration);

        if ($request->filled("projectCode"))
            $query->whereHas("programs", function ($q) use ($request) {
                $q->whereHas("project", function ($q2) use ($request) {
                    $q2->where("projectCode", $request->projectCode);
                });
            });

        if ($request->filled("province"))
            $query->whereHas("programs", function ($q) use ($request) {
                $q->whereHas("province", function ($q2) use ($request) {
                    $q2->where("name", $request->province);
                });
            });

        $beneficiaries = $query->get();

        if ($beneficiaries->isEmpty())
            return response()->json(["status" => false, "message" => "No beneficiary was found for applied filters !"], 404);

        return response()->json(["status" => true, "message" => "", "data" => $beneficiaries]);
    }

    public function filterEnacts (Request $request)
    {
        $query = Enact::query();

        if ($request->filled("projectCode"))
            $query->whereHas("project", function ($q) use ($request) {
                $q->where("projectCode", $request->projectCode);
            });

        if ($request->filled("province"))
            $query->whereHas("province", function ($q) use ($request) {
                $q->where("name", $request->province);
            });

        if ($request->filled("indicator"))
            $query->whereHas("indicator", function ($q) use ($request) {
                $q->where("indicatorRef", $request->indicator);
            });

        if ($request->filled("date"))
            $query->where("date", $request->date);

        $enacts = $query->get();

        if ($enacts->isEmpty())
            return response()->json([
                "status" => false,
                "message" => "No assessmensts was found for aplied filters !",
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

    public function filterUsers (Request $request)
    {
        $query = User::query();

        if ($request->filled("name"))
            $query->where("name", $request->name);

        if ($request->filled("email"))
            $query->where("email", $request->email);

        if ($request->filled("title"))
            $query->where("title", $request->title);

        if ($request->filled("status"))
            $query->where("status", $request->status);

        if ($request->filled("created_at"))
            $query->where("created_at", $request->created_at);

        $users = $query->get();

        if ($users->isEmpty())
            return response()->json([
                    "status" => false,
                    "message" => "No users was found for applied filters",
                    "data" => [],
            ]);

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $users,
        ]);

    }

    public function filterRoles (Request $request)
    {
        $query = Role::query();

        if ($request->filled("name"))
            $query->where("name", $request->name);

        if ($request->filled("status"))
            $query->where("status", $request->status);

        $roles = $query->get();

        if ($roles->isEmpty())
            return response()->json([
                "status" => false,
                "message" => "No roles was found for applied filters",
                "data" => []
            ]);

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $roles
        ]);

    }

    public function filterPermissoins (Request $request)
    {
        $query = Permission::query();

        if ($request->filled("group_name"))
            $query->where("group_name", $request->group_name);

        $permissions = $query->get();

        if ($permissions->isEmpty())
            return response()->json([
                "status" => false,
                "message" => "No permissions was found for applied filters !",
                "data" => []
            ]);

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $permissions
        ]);
    }

    public function filterSubmittedDatabases (Request $request)
    {
        $query = Apr::query()->where("status", "submitted")->orWhere("status", "firstRejected");

        if ($request->filled("projectCode"))
            $query->whereHas("project", function ($q) use ($request) {
                $q->where("projectCode", $request->projectCode);
            });

        if ($request->filled("database"))
            $query->whereHas("database", function ($q) use ($request) {
                $q->where("name", $request->database);
            });

        if ($request->filled("province"))
            $query->whereHas("province", function ($q) use ($request) {
                $q->where("name", $request->province);
            });

        if ($request->filled("fromDate"))
            $query->where("fromDate", $request->fromDate);

        if ($request->filled("toDate"))
            $query->where("toDate", $request->toDate);

        $aprs = $query->get();

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

    public function filterApprovedDatabases (Request $request)
    {
        $query = Apr::query()->where("status", "firstApproved")->orWhere("status", );

        if ($request->filled("projectCode"))
            $query->whereHas("project", function ($q) use ($request) {
                $q->where("projectCode", $request->projectCode);
            });

        if ($request->filled("database"))
            $query->whereHas("database", function ($q) use ($request) {
                $q->where("name", $request->database);
            });

        if ($request->filled("province"))
            $query->whereHas("province", function ($q) use ($request) {
                $q->where("name", $request->province);
            });

        if ($request->filled("fromDate"))
            $query->where("fromDate", $request->fromDate);

        if ($request->filled("toDate"))
            $query->where("toDate", $request->toDate);

        $aprs = $query->get();

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

    public function filterReviwedAprs (Request $request)
    {
        $query = Apr::query()->where("status", "secondRejected")->orWhere("status", "firstApproved");

        if ($request->filled("projectCode"))
            $query->whereHas("project", function ($q) use ($request) {
                $q->where("projectCode", $request->projectCode);
            });

        if ($request->filled("database"))
            $query->whereHas("database", function ($q) use ($request) {
                $q->where("name", $request->database);
            });

        if ($request->filled("province"))
            $query->whereHas("province", function ($q) use ($request) {
                $q->where("name", $request->province);
            });

        if ($request->filled("fromDate"))
            $query->where("fromDate", $request->fromDate);

        if ($request->filled("toDate"))
            $query->where("toDate", $request->toDate);

        $aprs = $query->get();

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

    public function filterApprovedAprs (Request $request)
    {
        $query = Apr::query()->where("status", "reviewed")->orWhere("status", "secondApproved");

        if ($request->filled("projectCode"))
            $query->whereHas("project", function ($q) use ($request) {
                $q->where("projectCode", $request->projectCode);
            });

        if ($request->filled("database"))
            $query->whereHas("database", function ($q) use ($request) {
                $q->where("name", $request->database);
            });

        if ($request->filled("province"))
            $query->whereHas("province", function ($q) use ($request) {
                $q->where("name", $request->province);
            });

        if ($request->filled("fromDate"))
            $query->where("fromDate", $request->fromDate);

        if ($request->filled("toDate"))
            $query->where("toDate", $request->toDate);

        $aprs = $query->get();

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
}
