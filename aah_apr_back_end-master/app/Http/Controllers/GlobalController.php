<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangeAprIncludeRequest;
use App\Models\District;
use App\Models\Indicator;
use App\Models\Program;
use App\Models\Project;
use App\Models\Province;
use App\Models\User;
use App\Models\Apr;
use App\Models\Database;
use App\Models\Beneficiary;
use App\Models\Training;
use App\Traits\AprToolsTrait;

class GlobalController extends Controller
{

    use AprToolsTrait;

    public function indexManagers ()
    {
        $usersWithRoleManager = User::role("manager")->select("id", "name")->get();

        if ($usersWithRoleManager->isEmpty()) 
            return response()->json(["status" => false, "message" => "No user with role manager was found !"], 404);

        return response()->json(["status" => true, "message" => "", "data" => $usersWithRoleManager]);
    }

    public function indexDatabaseIndicators(string $databaseName) {

        $indicators = Indicator::whereHas("database", function ($query) use ($databaseName) {
            $query->where("name", $databaseName);
        })->select("id", "indicatorRef")->get();

        if ($indicators->isEmpty()) return response()->json(["status" => false, "message" => "No indicator was found for " . $databaseName], 404);

        return response()->json(["status" => true, "message" => "", "data" => $indicators], 200);

    }

    // Just for selection.
    public function indexProgramsForSelection(string $databaseName)
    {
        $programs = Program::whereHas("database", function ($query) use ($databaseName) {
            $query->where("name", $databaseName);
        })->select("focalPoint")->get();

        if ($programs->isEmpty()) return response()->json(["status" => false, "message" => "No program for " . $databaseName . " found in system"], 404);

        return response()->json(["status" => true, "message" => "", "data" => $programs]);
    }

    // Just for selection.
    public function indexDistricts () {

        $districts = District::select("id", "name")->get();

        return response()->json(["status" => true, "message" => "", "data" => $districts]);
    }

    // Just for selection.
    public function indexProvinces ()
    {
        $provinces = Province::select("name")->get();

        return response()->json(["status" => true, "message" => "", "data" => $provinces]);
    }

    // Just for selection.
    public function indexProjects ()
    {
        $projects = Project::select("id", "projectCode")->get();

        return response()->json(["status" => true, "message" => "", "data" => $projects]);
    }

    public function indexProjectProvinces (string $id)
    {
        $project = Project::find($id);

        if (!$project) return response()->json(["status" => false, "message" => "No such project in system !"], 404);

        $provinces = $project->provinces;

        return response()->json(["status" => true, "message" => "", "data" => $provinces], 200);
    }

    public function indexDatabaseBeneficiaries(string $id) {

        $apr = Apr::find($id);

        if (!$apr) return response()->json(["status" => false, "message" => "No such database in system !"], 404);

        $trainingDb = Database::where("name", "training_database")->first();

        if (!$trainingDb) return response()->json(["status" => false, "message" => "Training database not found in system !"], 404);

        $trainingDbId = $trainingDb->id;

        if ($apr->database_id == $trainingDbId) {

            $trainings = Training::where("project_id", $apr->project_id)
            ->where("province_id", $apr->province_id)->get();

            $beneficiaries = $trainings->flatMap(function ($training) {
                return $training->beneficiaries;
            })->unique('id')->values();

        }

        else {
            $beneficiaries = Beneficiary::whereHas("programs", function ($q) use ($apr) {
                $q->where("project_id", $apr->project_id)->where("province_id", $apr->province_id);
            })->whereHas("databases", function ($q) use ($apr) {
                $q->where("name", Database::find($apr->database_id)->name);
            })->get();
        }

        return response()->json(["status" => true, "message" => "", "data" => $beneficiaries], 200);

    }

    public function indexProjectIndicatorsAccordingToAprogram(string $programId, string $databaseName) {

        $program = Program::find($programId);

        if (!$program) return response()->json(["status" => false, "message" => "No such program in system !", "data" => []], 404);

        $programProject = Project::find($program->project_id);

        if (!$programProject) return response()->json(["status" => false, "message" => "The selected program has no valid project in system !", "data" => []], 404);

        $databaseId = Database::where("name", $databaseName)->pluck("id");
        
        if (!$databaseId) return response()->json(["status" => false, "message" => "$databaseName is not a valid database !", "data" => []], 422);

        $indicators = $this->projectIndicatorsToASpicificDatabase($programProject, $databaseId[0]);

        if ($indicators->isEmpty()) return response()->json(["status" => false, "message" => "No indicator was found for selected program, project !", "data" => []], 404);

        return response()->json(["status" => true, "message" => "", "data" => $indicators], 200);

    }

    public function changeBeneficiaryAprIncluded (ChangeAprIncludeRequest $request)
    {
        $validated = $request->validated();

        $beneficiaries = Beneficiary::whereIn('id', $validated['ids'])->get();

        if ($beneficiaries->isEmpty())
            return response()->json(['status' => false, "message" => "Please select at least one beneficiary !"], 402);

        foreach ($beneficiaries as $bnf) {
            $bnf->aprIncluded = $validated['newStatus'] == 'included' ? true : false;
            $bnf->save();
        }

        $messageHelper = $validated['newStatus'] === 'notIncluded' ? 'Not Included' : 'Included';

        return response()->json(['status' => true, 'message' => 'Apr status successfully changed to ' . $messageHelper], 200);
    }
}