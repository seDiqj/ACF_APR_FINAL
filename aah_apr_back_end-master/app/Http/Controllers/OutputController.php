<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOutputRequest;
use App\Models\Outcome;
use App\Models\Output;
use App\Models\Project;
use Illuminate\Http\Request;

class OutputController extends Controller
{
    public function index (string $id) {

        $project = Project::find($id);

        if (!$id) return response()->json(["status" => false, "message" => "No such project in system !"]);

        $outputs = $project->outputs;

        if ($outputs->isEmpty()) return response()->json(["status" => false, "message" => "No outputs found found for this project !"], 404);

        return response()->json(["status" => true, "message" => "", "data" => $outputs]);

    }

    public function store(StoreOutputRequest $request) {

        $validated = $request->all();

        $corespondingOutcome = Outcome::find($validated["outcomeId"]);

        if (!$corespondingOutcome) return response()->json(["status" => false, "message" => "Selected outcome is not yet saved in database !"], 422);

        $validated["outcome_id"] = $corespondingOutcome->id;

        $createdOutput = Output::create($validated);

        return response()->json(["status" => true, "message" => "Output successfully saved !", "data" => $createdOutput], 200);

    }

    public function show (string $id)
    {
        $output = Output::find($id);
        
        if (!$output) return response()->json(["status" => false, "message" => "No such output in system !"], 404);

        $output["outcomeId"] = $output->outcome_id;
        unset(
            $output["created_at"],
            $output["updated_at"],
        );

        return response()->json(["status" => true, "message" => "", "data" => $output], 200);
    } 

    public function update(Request $request, string $id)
    {
        $output = Output::find($id);
        
        if (!$output) return response()->json(["status" => false, "message" => "No such output in database !"], 404);

        $validated = $request->validate([
            "output" => "required|string",
            "outputRef" => "required|string"
        ]);

        $output->update($validated);

        return response()->json(["status" => true, "message" => "Output updated successfully !"]);
    }

    public function destroy(Request $request) {

        $ids = $request->input("ids");

        $request->validate([
            "ids" => "required|array",
            "ids.*" => "intager",
        ]);

        Output::whereIn("id", $ids)->delete();

        return response()->json(["status" => true, "message" => "Outputs successfully deleted !"], 200);

    }

    public function destroyOutput(string $id) {

        $output = Output::find($id);

        if (!$output) return response()->json(["status" => false, "message" => "No such output in system !"], 404);


        $output->delete();

        return response()->json(["status" => false, "message" => "Output successfully deleted !"], 200);

    }
}