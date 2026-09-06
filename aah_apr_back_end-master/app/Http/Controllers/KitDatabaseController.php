<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreKitDatabaseBeneficiaryRequest;
use App\Http\Requests\StoreKitDistributionRequest;
use App\Http\Requests\StoreKitForBeneficiaryRequest;
use App\Http\Requests\UpdateKitDatabaseBeneficiaryRequest;
use App\Models\Beneficiary;
use App\Models\Database;
use App\Models\District;
use App\Models\Kit;
use App\Models\KitDistribution;
use App\Models\Program;
use App\Models\Project;
use App\Models\Province;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KitDatabaseController extends Controller
{
    public function indexBeneficiaries(Request $request) 
    {

        $kitDb = Database::where("name", "kit_database")->first();

        if (!$kitDb) return response()->json(["status" => false, "message" => "Kit Database is not in system"]);

        $kitDbId = $kitDb->id;

        $query = Beneficiary::query()->with(["programs", "indicators"]);

        $query->whereHas("programs", function ($q) use ($kitDbId, $request) {
            $q->where("database_program_beneficiary.database_id", $kitDbId);

            if ($request->filled("projectCode")) {
                $q->whereHas("project", function ($q2) use ($request) {
                    $q2->whereIn('id', (array) $request->input('projectCode'));
                });
            }

            if ($request->filled('focalPoint')) {
                $focalPoints = explode(",", $request->input("focalPoint"));
                $q->whereIn('focalPoint', $focalPoints);
            }

            if ($request->filled('province')) {
                $q->whereHas("province", function ($q3) use ($request) {
                    $q3->whereIn("id", (array) $request->input("province"));
                });
            }

            if ($request->filled('siteCode')) {
                $siteCodes = explode(",", $request->input("siteCode"));
                $q->whereIn('siteCode', $siteCodes);
            }

            if ($request->filled('healthFacilitator')) {
               $hf = explode(',', $request->input("healthFacilitator"));
                $q->whereIn('healthFacilityName', $hf);
            }

        });

        if ($request->filled('dateOfRegistration')) {
            $dates = explode(",", $request->input("dateOfRegistration"));
            $query->whereIn('dateOfRegistration', $dates);
        }

        if ($request->filled('age')) {
            $ages = explode(",", $request->input("age"));
            $query->where(function ($q) use ($ages) {
                foreach ($ages as $age) {
                    $q->orWhere("age", "like", "%" . $age . "%");
                }
            });
        }

        if ($request->filled('maritalStatus')) {
            $query->whereIn('maritalStatus', (array) $request->input('maritalStatus'));
        }

        if ($request->filled('householdStatus')) {
            $query->whereIn('householdStatus', (array) $request->input('householdStatus'));
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
                        ->orWhere("fatherHusbandName", "like", "%" . $nameOrCode . "%")
                        ->orWhere("name", "like", "%" . $nameOrCode . "%");
                }
            });
        }

        $perPage = $request->integer("perPage", 10);
        $order = $request->str("order", "desc");

        $beneficiaries = $query->orderBy("created_at", $order)->paginate($perPage);
        
        if ($beneficiaries->isEmpty()) return response()->json(["status" => false, "message" => "No beneficiary was found !", "data" => []], 200);
        
        $beneficiaries->getCollection()->transform(function ($beneficiary) {
            $beneficiary->programName =  optional($beneficiary->programs->first())->name;
            unset($beneficiary->programs);
            return $beneficiary;
        });
        
        return response()->json(["status" => true, "message" => "", "data" => $beneficiaries]);

    }

    public function indexBeneficiaryKitList(Request $request, string $id)
    {
        /*
        |--------------------------------------------------------------------------
        | Get Beneficiary
        |--------------------------------------------------------------------------
        */

        $beneficiary = Beneficiary::with("kits")
            ->where("id", $id)
            ->first();

        if (!$beneficiary) {
            return response()->json([
                "status" => false,
                "message" => "No such user in system !",
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Kits Query
        |--------------------------------------------------------------------------
        */

        $query = $beneficiary->kits();

        /*
        |--------------------------------------------------------------------------
        | Search By Kit Name
        |--------------------------------------------------------------------------
        */

        if ($search = $request->input("search")) {

            $kitNames = array_filter(
                array_map(
                    "trim",
                    explode(",", $search)
                )
            );

            $query->where(function ($q) use ($kitNames) {

                foreach ($kitNames as $name) {

                    $q->orWhere(
                        "kits.name",
                        "like",
                        "%" . $name . "%"
                    );

                }

            });
        }

        /*
        |--------------------------------------------------------------------------
        | Filter By Kit
        |--------------------------------------------------------------------------
        */

        $query->when(
            $request->filled("kit"),
            function ($q) use ($request) {

                $q->whereIn(
                    "kits.id",
                    (array) $request->input("kit")
                );

            }
        );

        /*
        |--------------------------------------------------------------------------
        | Filter By Distribution Date
        |--------------------------------------------------------------------------
        */

        $query->when(
            $request->filled("destribution_date"),
            function ($q) use ($request) {

                $q->whereHas(
                    "distributions",
                    function ($distributionQuery) use ($request) {

                        /*
                        |--------------------------------------------------------------------------
                        | IMPORTANT
                        |--------------------------------------------------------------------------
                        |
                        | Do NOT use:
                        |
                        | distributions.destribution_date
                        |
                        | Because "distributions" is the relationship name,
                        | NOT necessarily the database table name.
                        |
                        */

                        $distributionQuery->where(
                            "destribution_date",
                            $request->input("destribution_date")
                        );

                    }
                );

            }
        );

        /*
        |--------------------------------------------------------------------------
        | Filter By Received Status
        |--------------------------------------------------------------------------
        */

        /*
        |--------------------------------------------------------------------------
        | Get Kits
        |--------------------------------------------------------------------------
        */

        $kits = $query->get();

        /*
        |--------------------------------------------------------------------------
        | Empty Result
        |--------------------------------------------------------------------------
        */

        if ($kits->isEmpty()) {

            return response()->json([
                "status" => true,
                "message" => "No kit found for selected beneficiary !",
                "data" => [],
            ], 200);

        }

        /*
        |--------------------------------------------------------------------------
        | Manipulate Result
        |--------------------------------------------------------------------------
        */

        $manipulatedKits = $kits->map(function ($kit) {

            return [

                "id" => $kit->id,

                "kit" => $kit->name,

                "distributionDate" =>
                    $kit->pivot->destribution_date,

                "isReceived" =>
                    $kit->pivot->is_received == 1
                        ? "Yes"
                        : "No",

                "remark" =>
                    $kit->pivot->remark,

            ];

        });

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $manipulatedKits,
        ]);
    }

    public function indexKitList () 
    {
        $kits = Kit::select("id", "name")->where("status", "active")->get();

        if ($kits->isEmpty()) return response()->json(["status" => false, "message" => "No kit in system !", "data" => []], 200);

        return response()->json(["status" => true, "message" => "", "data" => $kits]);
    }
    
    public function addNewKitToBeneficiary (StoreKitForBeneficiaryRequest $request, string $id)
    {
        
        $validated = $request->validated();

        $beneficiary = Beneficiary::find($id);

        if (!$beneficiary) return response()->json(["status" => false, "message" => "No such beneficiary in system !"], 404);

        $beneficiary->kits()->attach($request->kitId, [
            "destribution_date" => $validated["destribution_date"],
            "remark" => $validated["remark"],
            "is_received" => $validated["is_received"]
        ]);

        return response()->json(["status" => true, "message" => "Kit successfully added !"], 200);
        
    }

    public function addNewKitToBeneficiaries(Request $request)
    {
        $validated = $request->validate([
            'kitData.kitId' => ['required', 'exists:kits,id'],
            'kitData.destribution_date' => ['required', 'date'],
            'kitData.remark' => ['nullable', 'string'],
            'kitData.is_received' => ['required', 'boolean'],
            'beneficiaryIds' => ['required', 'array'],
            'beneficiaryIds.*' => ['exists:beneficiaries,id'],
        ]);

        DB::beginTransaction();

        try {

            $beneficiaries = Beneficiary::whereIn('id', $validated['beneficiaryIds'])->get();

            foreach ($beneficiaries as $beneficiary) {
                $beneficiary->kits()->syncWithoutDetaching([
                    $validated['kitData']['kitId'] => [
                        "destribution_date" => $validated['kitData']['destribution_date'],
                        "remark" => $validated['kitData']['remark'] ?? null,
                        "is_received" => $validated['kitData']['is_received']
                    ]
                ]);
            }

            DB::commit();

            return response()->json([
                "status" => true,
                "message" => "Kit successfully added to beneficiaries!"
            ]);

        } catch (\Throwable $e) {

            DB::rollBack();

            return response()->json([
                "status" => false,
                "message" => "Failed to add kit."
            ], 500);
        }
    }

    public function storeBeneficiary(StoreKitDatabaseBeneficiaryRequest $request) 
    {

        if (!($request->input("program") || $request->input("indicators"))) 
            return response()->json(["status" => false, "message" => "Please select a valid indicator / program", "data" => $request->all()], 422);

        $program = Program::with("project")->find($request->input("program"));

        if (!$program) return response()->json(["status" => false, "message" => "No such program in system !", "data" => []], 404);

        $dateOfRegistration = Carbon::parse($request->input("dateOfRegistration"))->startOfDay();
        $projectStartDate = Carbon::parse($program->project->startDate)->startOfDay();
        $projectEndDate = Carbon::parse($program->project->endDate)->endOfDay();

        if ($dateOfRegistration->gt($projectEndDate) || $dateOfRegistration->lt($projectStartDate))
            return response()->json(["status" => false, "message" => "Date of registration should not be out of project start date and end date range !", "data" => []], 422);

        $indicators = $request->input("indicators");

        $validated = $request->validated();

        $validated["protectionServices"] = null;

        $validated["aprIncluded"] = true;

        $beneficiary = Beneficiary::create($validated);

        $beneficiary->indicators()->sync($indicators);

        $kitDbId = Database::where("name", "kit_database")->first()->id;

        if (!$kitDbId) 
                return response()->json(["status" => false, "message" => "Kit database is not a valid database !", "data" => []], 404);

        $beneficiary->programs()->attach($request->input("program"), [
            "database_id" => $kitDbId
        ]);

        return response()->json(["status" => true, "message" => "Beneficiary successfully created !"], 200);

    }

    public function storeBeneficiaryKit(StoreKitDistributionRequest $request) {

        $validated = $request->validated();

        $distribution = KitDistribution::create($validated);

        if (!$distribution->exists) return response()->json(["status" => false, "message" => "Somthing gone wrong !"], 500);

        return response()->json(["status" => true, "message" => "Kit successfully added !"], 200);

    }

    public function showBeneficiary(string $id)
    {
        $beneficiary = Beneficiary::with(['indicators:id', 'programs:id'])
            ->select(
                "id",
                "name",
                "dateOfRegistration",
                "code",
                "fatherHusbandName",
                "age",
                "gender",
                "maritalStatus",
                "childCode",
                "childAge",
                "phone",
                "literacyLevel",
                "householdStatus",
                "disabilityType",
                "protectionServices"
            )
            ->where('id', $id)
            ->first();

        if (!$beneficiary) {
            return response()->json([
                "status" => false,
                "message" => "No such beneficiary in system !"
            ], 404);
        }

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => [
                ...$beneficiary->toArray(),

                'indicators' => $beneficiary->indicators->pluck('id'),

                'program' => $beneficiary->programs()->where("database_program_beneficiary.database_id", Database::where("name", "kit_database")->first()->id)->first()->id,
            ]
        ]);
    }

    public function showBeneficiaryProgram(string $id) {

        $beneficiary = Beneficiary::with("programs")->find($id);

        if (!$beneficiary) return response()->json(["status" => false, "message" => "No such beneficiary in system !"], 404);

        if ($beneficiary->programs->isEmpty()) return response()->json(["status" => false, "message" => "No program was found for this beneficiary !"], 404);

        $programs = $beneficiary->programs->map(function ($program) {
            return [
                "projectCode" => Project::find($program->project_id)->projectCode,
                "focalPoint" => $program->focalPoint,
                "province" => Province::where("id", $program->province_id)->first()->name,
                "district" => District::where("id", $program->district_id)->first()->name,
                "village" => $program->village,
                "siteCode" => $program->siteCode,
                "healthFacilityName" => $program->healthFacilityName,
                "interventionModality" => $program->interventionModality
            ];
        });

        return response()->json(["status" => true, "message" => "", "data" => $programs]);

    }

    public function showKit (string $id)
    {
        $kit = KitDistribution::find($id);

        $kit->kitId = $kit->kit_id;

        unset(
            $kit->kit_id,
            $kit->created_at,
            $kit->updated_at
        );
        
        if (!$kit) return response()->json(["status" => false, "message" => "No such kit in system !"], 404);

        return response()->json(["status" => false, "message" => "", "data" => $kit], 200);
    }

    public function updateBeneficiary(UpdateKitDatabaseBeneficiaryRequest $request, string $id) 
    {

        $kitDatabaseFromDb = Database::where("name", "kit_database")->first();

        if (!$kitDatabaseFromDb) return response()->json(["status" => false, "message" => "Kit database is not a valid database in system !"], 404);

        $beneficiary = Beneficiary::find($id);

        if (!$beneficiary) return response()->json(["status" => false, "message" => "No such beneficiary in system !"], 404);

        $beneficiary->update($request->all());

        $beneficiary->indicators()->sync($request->input("indicators"));

        $beneficiary->programs()->sync([$request->input("program") => ["database_id" => $kitDatabaseFromDb->id]]);

        return response()->json(["status" => true, "message" => "Beneficiary successfully updated !"], 200);

    }

    public function updateKit(Request $request, string $id) 
    {

        $kit = KitDistribution::find($id);

        if (!$kit) return response()->json(["status" => false, "message" => "No such kit in system !"], 404);

        $validated = $request->validate([
            "distribution_date" => "required|date",
            "remark" => "required|string",
            "is_received" => "required|boolean"
        ]);

        $kit->update($validated);

        return response()->json(["status" => true, "message" => "Kit successfully updated !"], 200);

    }

    public function destroyBeneficiary(Request $request) 
    {

        $ids = $request->input("ids");

        $request->validate([
            "ids" => "required|array",
            "ids.*" => "integer"
        ]);

        $isMoreThenOne = count($ids) > 1 ? true : false;

        Beneficiary::whereIn("id", $ids)->delete();

        return response()->json(["status" => true, "message" => $isMoreThenOne ? "Beneficiaries " : "Beneficiary " . "successfully deleted !"], 200);

    }

    public function destroyKitFromBeneficiary(Request $request, string $id) 
    {

        $request->validate([
            "ids" => "required|array",
            "ids.*" => "integer"
        ]);

        $ids = $request->input("ids");

        $isMoreThenOne = count($ids) > 1 ? true : false;

        $beneficiary = Beneficiary::find($id);

        if (!$beneficiary) return response()->json(["status" => false, "message" => "No such beneficiary in system !"]);

        $beneficiary->kits()->whereIn("id", $ids)->delete();

        return response()->json(["status" => true, "message" => $isMoreThenOne ? "Kits " : "Kit " . "successfully deleted !"], 200);

    }
}
