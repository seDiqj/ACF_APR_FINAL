<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreIndicatorRequest;
use App\Models\Database;
use App\Models\Dessaggregation;
use App\Models\Indicator;
use App\Models\IndicatorProvince;
use App\Models\IndicatorType;
use App\Models\Isp3;
use App\Models\Output;
use App\Models\Project;
use App\Models\Province;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class IndicatorController extends Controller
{
    public function index(string $id) {

        $project = Project::where("id", $id)->first();

        if (!$project) return response()->json(["status" => false, "message" => "No such project in system"], 404);

        $indicators = $project->indicators()->where("parent_indicator", "==", null)->get();

        if ($indicators->isEmpty()) return response()->json(["status" => false, "message" => "No indicator was found for this project !"], 404);

        return response()->json(["status" => true, "message" => "", "data" => $indicators]);

    }

    public function store(Request $request)
    {
        $indicator = $request->input('indicator');

        
        $createdIndicators = [];

        if (!is_array($indicator)) return response()->json(["status" => false, "message" => "Invalid indicator data !"], 422);
        
        $output = Output::find($indicator["outputId"]);

        if (!$output) return response()->json(["status" => false, "message" => "Invalid output for indicator with " . $indicator["indicatorRef"] . " reference!"], 404);

        $database = Database::where("name", $indicator["database"])->first();
        if (!$database) return response()->json(["status" => false, "message" => "Invalid database for indicator with " . $indicator["indicatorRef"] . " reference!"], 404);

        $typeId = null;
        if (!empty($indicator["type"])) {
            $dbType = IndicatorType::where("type", $indicator["type"])->first();
            if (!$dbType) return response()->json(["status" => false, "message" => "Invalid type selected for indicator with reference " . $indicator["indicatorRef"]], 404);
            $typeId = $dbType->id;
        }

        $main = Indicator::create([
            'output_id' => $output->id,
            'database_id' => $database->id,
            'type_id' => $typeId,
            'indicator' => $indicator['indicator'],
            'indicatorRef' => $indicator['indicatorRef'],
            'target' => $indicator['target'],
            'achived_target' => 0,
            'status' => $indicator['status'],
            'dessaggregationType' => $indicator['dessaggregationType'],
            'description' => $indicator['description'],
            'parent_indicator' => null,
        ]);

        array_push($createdIndicators, [
            "id" => $main->id,
            "indicatorRef" => $main->indicatorRef
        ]);

        $provincesDetails = $indicator["provinces"] ?? [];
        $provincesNames = collect($provincesDetails)->pluck('province')->toArray();
        $provincesIds = Province::whereIn("name", $provincesNames)->pluck("id", "name")->toArray();
        
        $finalProvincesData = [];
        foreach ($provincesDetails as $provinceData) {
            $provinceName = strtolower($provinceData["province"]);
            if (!isset($provincesIds[$provinceName])) continue;
            $finalProvincesData[$provincesIds[$provinceName]] = [
                "target" => $provinceData["target"],
                "achived_target" => 0,
                "councilorCount" => $provinceData["councilorCount"]
            ];
        }

        

        $main->provinces()->sync($finalProvincesData);

        if (!empty($indicator['subIndicator'])) {
            $sub = $indicator['subIndicator'];

            $createdSub = Indicator::create([
                'output_id' => $output->id,
                'database_id' => $database->id,
                'type_id' => null,
                'indicator' => $sub['name'],
                'indicatorRef' => $sub['indicatorRef'],
                'target' => $sub['target'] ?? $indicator['target'],
                'achived_target' => 0,
                'status' => $indicator['status'],
                'dessaggregationType' => $sub['dessaggregationType'],
                'description' => $indicator['description'],
                'parent_indicator' => $main->id,
            ]);

            array_push($createdIndicators, [
                "id" => $createdSub->id,
                "indicatorRef" => $createdSub->indicatorRef
            ]);

            $subProvinces = $sub["provinces"] ?? [];
            $finalSubData = [];
            foreach ($subProvinces as $provinceData) {
                $provinceName = strtolower($provinceData["province"]);
                if (!isset($provincesIds[$provinceName])) continue;
                $finalSubData[$provincesIds[$provinceName]] = [
                    "target" => $provinceData["target"],
                    "achived_target" => 0,
                    "councilorCount" => $provinceData["councilorCount"]
                ];
            }

            $createdSub->provinces()->sync($finalSubData);
        }

        return response()->json(["status" => true, 'message' => 'Indicators saved successfully.', "data" => $createdIndicators], 201);
    }

    protected function validateIndicator(array $data)
    {
        $rules = (new StoreIndicatorRequest)->rulesForSingleIndicator();

        return Validator::make($data, $rules)->validate();
    }

    public function show($id)
    {
        $indicator = Indicator::with('subIndicator')->find($id);

        if (!$indicator) {
            return response()->json([
                'status' => false,
                'message' => 'Indicator not found.'
            ], 404);
        }

        $indicator["provinces"] = $indicator->provinces->map(function ($province) {
            $province["province"] = $province->name;
            $province["councilorCount"] = $province->pivot->councilorCount;
            $province["target"] = $province->pivot->target;

            unset($province["pivot"], $province["name"]);

            return $province;
        });

        $data = [
            'id' => $indicator->id,
            'outputId' => $indicator->output->id,
            'indicator' => $indicator->indicator,
            'indicatorRef' => $indicator->indicatorRef,
            'target' => $indicator->target,
            'status' => $indicator->status,
            'provinces' => $indicator->provinces,
            'dessaggregationType' => $indicator->dessaggregationType,
            'description' => $indicator->description,
            'database' => $indicator->database->name,
            'type' => $indicator->type?->type,
            'parentIndicator' => $indicator->parent_indicator,
            'subIndicator' => $indicator->subIndicator?->map(function($sub) use ($indicator) {
                return [
                    'indicatorRef' => $sub->indicatorRef,
                    'name' => $sub->indicator,
                    'target' => $sub->target ?? $indicator->target,
                    'dessaggregationType' => $sub->dessaggregationType ?? $indicator->dessaggregationType,
                    'provinces' => $sub->provinces->map(function ($province) {
                       $province["province"] = $province->name;
                        $province["councilorCount"] = $province->pivot->councilorCount;
                        $province["target"] = $province->pivot->target;

                        unset($province["pivot"], $province["name"]);

                        return $province;
                    }),
                ];
            })->first() 
        ];

        return response()->json([
            'status' => true,
            'message' => '',
            'data' => $data
        ]);
    }

    public function update(Request $request, $id)
    {
        $indicator = Indicator::find($id);

        if (!$indicator) {
            return response()->json([
                'status' => false,
                'message' => 'No such indicator in system !'
            ], 404);
        }

        $output = Output::find($request->input("outputId"));
        if (!$output) {
            return response()->json(["status" => false, "message" => "Invalid output ref!"], 404);
        }

        $database = Database::where('name', $request->input("database", $indicator->database->name))->first();
        if (!$database) {
            return response()->json(["status" => false, "message" => "Invalid database!"], 404);
        }

        $indicator->update([
            'output_id' => $output->id,
            'database_id' => $database->id,
            'indicator' => $request->input('indicator', $indicator->indicator),
            'indicatorRef' => $request->input('indicatorRef', $indicator->indicatorRef),
            'target' => $request->input('target', $indicator->target),
            'achived_target' => $request->input('achived_target', $indicator->achived_target),
            'status' => $request->input('status', $indicator->status),
            'dessaggregationType' => $request->input('dessaggregationType', $indicator->dessaggregationType),
            'description' => $request->input('description', $indicator->description),
        ]);

        if ($request->input('dessaggregationType') !== $indicator->dessaggregationType) {
            if ($request->input('dessaggregationType') == "session") {
                $coresspondingDessaggregations = Dessaggregation::where("indicator_id", $indicator->id)->get();

                if ($request->has('subIndicator') && $request->input("subIndicator") != null) {
                    $sub = $request->input('subIndicator');

                    $subIndicator = Indicator::firstOrNew([
                        'indicatorRef' => $sub['indicatorRef'],
                        'parent_indicator' => $indicator->id
                    ]);

                    foreach ($coresspondingDessaggregations as $d) {
                        $d->indicator_id = $subIndicator->id;
                        $d->save();
                    }

                    $subIndicatorCorrespondingDessaggregations = Dessaggregation::where("indicator_id", $subIndicator->id)->get();

                    foreach ($subIndicatorCorrespondingDessaggregations as $d) {
                        $d->indicator_id = $indicator->id;
                        $d->save();
                    }
                }
            }
        }

        $provincesDetails = $request->input("provinces", []);
        if (is_array($provincesDetails) && count($provincesDetails) > 0) {
            $provincesNames = collect($provincesDetails)->pluck('province')->toArray();
            $provincesIds = Province::whereIn("name", $provincesNames)
                ->pluck("id", "name")->toArray();

            $finalProvincesData = [];
            foreach ($provincesDetails as $provinceData) {
                $provinceName = $provinceData["province"];
                if (!isset($provincesIds[$provinceName])) continue;
                $finalProvincesData[$provincesIds[$provinceName]] = [
                    "target" => $provinceData["target"],
                    "councilorCount" => $provinceData["councilorCount"] ?? 0,
                    "achived_target" => IndicatorProvince::whereHas("province", function ($q) use ($provinceData) {
                        $q->where("name", $provinceData["province"]);
                    })?->first()->achived_target ?? 0
                ];
            }

            $indicator->provinces()->sync($finalProvincesData);
        }

        if ($request->has('subIndicator') && $request->input("subIndicator") != null) {
            $sub = $request->input('subIndicator');

            $subIndicator = Indicator::firstOrNew([
                'indicatorRef' => $sub['indicatorRef'],
                'parent_indicator' => $indicator->id
            ]);

            $subIndicator->fill([
                'output_id' => $output->id,
                'database_id' => $database->id,
                'indicator' => $sub['name'],
                'target' => $sub['target'] ?? $indicator->target,
                'achived_target' => $subIndicator->achived_target ?? 0,
                'status' => $sub['status'] ?? $indicator->status,
                'dessaggregationType' => $sub['dessaggregationType'] ?? $indicator->dessaggregationType,
                'description' => $sub['description'] ?? $indicator->description,
                'parent_indicator' => $indicator->id,
            ]);

            $subIndicator->save();

            $subProvinces = $sub["provinces"] ?? [];
            if (is_array($subProvinces) && count($subProvinces) > 0) {
                $subProvinceNames = collect($subProvinces)->pluck('province')->toArray();
                $subProvincesIds = Province::whereIn("name", $subProvinceNames)
                    ->pluck("id", "name")->toArray();

                $finalSubData = [];
                foreach ($subProvinces as $provinceData) {
                    $provinceName = strtolower($provinceData["province"]);
                    if (!isset($subProvincesIds[$provinceName])) continue;
                    $finalSubData[$subProvincesIds[$provinceName]] = [
                        "target" => $provinceData["target"],
                        "achived_target" => $provinceData["achived_target"] ?? 0,
                        "councilorCount" => $provinceData["councilorCount"] ?? 0,
                    ];
                }

                $subIndicator->provinces()->sync($finalSubData);
            }
        } else  {

            $subIndicator =Indicator::where("parent_indicator", $id)->first();

            if ($subIndicator) $subIndicator->delete();

        }

        return response()->json([
            'status' => true,
            'message' => 'Indicator updated successfully.',
            'data' => [
                'id' => $indicator->id,
                'indicatorRef' => $indicator->indicatorRef
            ]
        ], 200);
    }


    public function destroy($id)
    {
        $indicator = Indicator::find($id);

        if (!$indicator) {
            return response()->json([
                'status' => false,
                'message' => 'Indicator not found.'
            ], 404);
        }

        $indicator->delete();

        return response()->json([
            'status' => true,
            'message' => 'Indicator successfully deleted!'
        ]);
    }

    public function setIsp3s (Request $request)
    {
        $isp3s = $request->input("isp3s");

        foreach ($isp3s as $isp3) {
            
            $dbIsp3 = Isp3::where("description", $isp3["isp3"])->first();

            $dbIsp3->indicators()->sync($isp3["indicators"]);

        }

        return response()->json(["status" => true, "message" => "Isp3's successfully saved !"], 200);
    }

}
