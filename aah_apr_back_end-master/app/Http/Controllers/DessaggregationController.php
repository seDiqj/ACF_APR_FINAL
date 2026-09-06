<?php

namespace App\Http\Controllers;

use App\Models\Dessaggregation;
use App\Models\Indicator;
use App\Models\Province;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DessaggregationController extends Controller
{
    public function index(string $id)
    {

        $dessaggregations = DB::table('dessaggregations')
                                    ->join('indicators', 'dessaggregations.indicator_id', '=', 'indicators.id')
                                    ->join('outputs', 'indicators.output_id', '=', 'outputs.id')
                                    ->join('outcomes', 'outputs.outcome_id', '=', 'outcomes.id')
                                    ->where('outcomes.project_id', $id)
                                    ->select('dessaggregations.*')
                                    ->get();


        if ($dessaggregations->isEmpty()) return response()->json(["status" => false, "message" => "No dessaggregations was found for this project !"], 404);

        return response()->json(["status" => true, "message" => "", "data" => "dessaggregations"], 200);

    }

    public function store(Request $request)
    {

        $dessaggregations = $request->input("dessaggregations");

        foreach ($dessaggregations as $dessaggregation) 
        {
            $corespondingIndicator = Indicator::find($dessaggregation["indicatorId"]);

            if (!$corespondingIndicator)
                return response()->json(["status" => false, "message" => "Invalid indicator for dessaggregation " . $dessaggregation["dessaggration"]], 422);

            $province = Province::where("name", $dessaggregation["province"])->first();

            if (!$province) return response()->json(["status" => false, "message" => "Invalid province for dessaggregation " . $dessaggregation["dessaggregation"]], 422);

            $dessaggregation["indicator_id"] = $corespondingIndicator->id;

            $dessaggregation["province_id"] = $province->id;

            $dessaggregation["achived_target"] = 0;

            $dessaggregation["description"] = $dessaggregation["dessaggration"];

            unset($dessaggregation["dessaggration"]);
            unset($dessaggregation["indicatorRef"]);
            unset($dessaggregation["province"]);

            $exist = Dessaggregation::where("description", $dessaggregation["description"])->where("province_id", $province->id)->where("indicator_id", $dessaggregation["indicatorId"])->first();

            if ($exist)
                $exist->update($dessaggregation);
            else
                Dessaggregation::create($dessaggregation);
                        
        }

        return response()->json(["status" => true, "message" => "Dessaggregations successfully saved !"], 200);

    }

    public function update(Request $request)
    {
        $dessaggregations = $request->input("dessaggregations");

        foreach ($dessaggregations as $dessaggregation) 
        {
            $indicator = Indicator::find($dessaggregation["indicatorId"]);
            if (!$indicator) {
                return response()->json([
                    "status" => false,
                    "message" => "Invalid indicator reference for dessaggregation " . $dessaggregation["dessaggration"]
                ], 422);
            }

            $province = Province::where("name", $dessaggregation["province"])->first();
            if (!$province) {
                return response()->json([
                    "status" => false,
                    "message" => "Invalid province for dessaggregation " . $dessaggregation["dessaggration"]
                ], 422);
            }

            $data = [
                "target" => $dessaggregation["target"] ?? 0,
                "achived_target" => $dessaggregation["achived_target"] ?? 0,
                "councilorCount" => $dessaggregation["councilorCount"] ?? 0,
                "description" => $dessaggregation["dessaggration"],
            ];

            Dessaggregation::updateOrCreate(
                [
                    "indicator_id" => $indicator->id,
                    "province_id" => $province->id,
                    "description" => $dessaggregation["dessaggration"]
                ],
                $data
            );
        }

        

        return response()->json([
            "status" => true,
            "message" => "Dessaggregations successfully updated!"
        ], 200);
    }

}
