<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOutcomeRequest;
use App\Models\Outcome;
use App\Models\Project;
use Illuminate\Http\Request;

class OutcomeController extends Controller
{

    public function index(string $id)
    {
        $outcomes = Outcome::where("project_id", $id)->get();
    
        if ($outcomes->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No outcome for your project!"
            ], 404);
        }
    
        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $outcomes
        ]);
    }
    
    public function store(StoreOutcomeRequest $request)
    {
        $validated = $request->validated();

        $projectId = $request["project_id"];

        $project = Project::find($projectId);

        if (!$project) return response()->json(["status" => false, "message" => "No such project in system !"], 404);

        $validated["project_id"] = $projectId;
        
        $createdOutcome = Outcome::create($validated);

        return response()->json(["status" => true, "message" => "Outcomes successfully saved !", "data" => $createdOutcome]);

    }

    public function show (string $id)
    {
        $outcome = Outcome::find($id);
        
        if (!$outcome) return response()->json(["status" => false, "message" => "No such outcome in system !"], 404);

        unset($outcome["project_id"]);

        return response()->json(["status" => true, "message" => "", "data" => $outcome]);

    }
    
    public function update(Request $request, $id)
    {

        $outcome = Outcome::find($id);

        if (!$outcome) return response()->json(["status" => false, "message" => "No such outcome in database !"], 404);

        $validated = $request->validate([
            'outcome' => 'required|string',
            'outcomeRef' => 'required|string'
        ]);

        $outcome->update($validated);
        
        return response()->json(['status' => true, 'message' => 'Outcome updated successfully']);
    }


    public function destroy(string $id)
    {
        $outcome = Outcome::find($id);

        if (!$outcome) return response()->json(["status" => false, "message" => "No such outcome in system !"], 404);

        $outcome->delete();

        return response()->json([
            'status' => true,
            'message' => 'Outcome successfully deleted !'
        ]);
    }
}

