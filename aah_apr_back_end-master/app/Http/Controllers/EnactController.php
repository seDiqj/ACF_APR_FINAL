<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEnactRequest;
use App\Models\Assessment;
use App\Models\Enact;
use App\Models\Indicator;
use App\Models\Project;
use App\Models\Province;
use App\Models\Question;
use Illuminate\Http\Request;
use Carbon\Carbon;

class EnactController extends Controller
{
    public function index(Request $request)
    {
        $query = Enact::query()->with(['project']);

        $query->when($request->filled('projectCode'), fn($q) =>
            $q->whereIn('project_id', $request->input('projectCode'))
        );

        $query->when($request->filled('province'), fn($q) =>
            $q->whereIn('province_id', $request->input('province'))
        );

        $query->when($request->filled('indicator'), fn($q) =>
            $q->whereIn('indicator_id', $request->input('indicator'))
        );

        $query->when($request->filled('date'), function ($q) use ($request) {
            $dates = explode(',', $request->input('date'));
            $q->whereIn('date', $dates);
        }
        );

        $query->when($request->input('search'), fn($q) =>
            $q->whereHas('project', function ($q2) use ($request) {
                $codes = explode(',', $request->input('search'));
                $q2->whereIn('projectCode', $codes);
            }
            )
        );

        $perPage = $request->integer("perPage", 10);
        $order = $request->str("order", "desc");

        $enacts = $query->orderBy("created_at", $order)->paginate($perPage);

        if ($enacts->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => 'No assessment was found !',
                "data" => []
            ], 200);
        }

        $enacts->getCollection()->transform(function ($enact) {

            $tempProvince = $enact->province;
            $tempProject = $enact->project;
            $tempIndicator = $enact->indicator;

            unset($enact->project, $enact->province, $enact->indicator);

            $enact->projectCode = $tempProject?->projectCode;
            $enact->province = $tempProvince?->name;
            $enact->indicatorRef = $tempIndicator?->indicatorRef;


            return $enact;
        });

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $enacts
        ]);
    }

    public function indexAssessmentsList ()
    {
        $Questions = Question::all();

        if ($Questions->isEmpty()) return response()->json(["status" => false, "message" => "No Questions found in system !"], 404);

        $finalData = $Questions->groupBy("group");

        return response()->json(["status" => true, "message" => "", "data" => $finalData]);
    }

    public function store (StoreEnactRequest $request)
    {

        $project = Project::find($request->input("project_id"));

        if (!$project)
            return response()->json(["status" => false, "message" => "No such project in system !", "data" => []], 404);

        $projectStartDate = Carbon::parse($project->startDate)->startOfDay();
        $projectEndDate = Carbon::parse($project->endDate)->endOfDay();
        $dateOfAssessment = Carbon::parse($request->input('date'))->startOfDay();

        if ($dateOfAssessment->gt($projectEndDate) || $dateOfAssessment->lt($projectStartDate))
            return response()->json(["status" => false, "message" => "Assessment date should be not out of project date range !", "data" => []], 422);

        $validated = $request->validated();

        Enact::create($validated);

        return response()->json(["status" => true, "message" => "Assessment successfully saved !"], 200);
    }


    public function update (StoreEnactRequest $request, string $id)
    {
        $enact = Enact::find($id);

        if (!$enact) return response()->json(["status" => false, "message" => "No such assessment in system !"], 404);

        $validated = $request->validated();

        $enact->update($validated);

        return response()->json(["status" => true, "message" => "Assessment successfully updated !"], 200);
    }


    public function showForProfile(string $id) {
        $enact = Enact::find($id);

        if (!$enact) {
            return response()->json([
                "status" => false,
                "message" => "No such assessment in system!"
            ], 404);
        }

        $project = Project::find($enact->project_id);
        $indicator = Indicator::find($enact->indicator_id);
        $province = Province::find($enact->province_id);

        $enact->projectCode = $project?->projectCode;
        $enact->indicatorReference = $indicator?->indicatorRef;
        $enact->provinceName = $province?->name;
        $enact->projectStartDate = $project?->startDate ? Carbon::parse($project->startDate)->format('Y-m-d') : null;
        $enact->projectEndDate = $project?->endDate ? Carbon::parse($project->endDate)->format('Y-m-d') : null;

        unset($enact->indicator_id, $enact->province_id);

        $enact->assessments = $enact->assessments()->select('id', 'date', 'totalScore')->get()->map(function ($a) {
            $a->date = $a->date ? Carbon::parse($a->date)->format('Y-m-d') : null;
            return $a;
        });

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $enact
        ]);
    }

    public function show (string $id)
    {
        $enact = Enact::find($id);

        if (!$enact) return response()->json(["status" => false, "message" => "No such assessment in system !"], 404);

        return response()->json(["status" => true, "message" => "" , "data" => $enact]);
    }

    public function showAssessment (string $id)
    {
        $assessment = Assessment::find($id);

        if (!$assessment) return response()->json(["status" => false, "message" => "No such assessment in the system !"], 404);

        $questions = $assessment->questions;

        $finalData = [
            "assessment" => $assessment,
            "questions" => $questions
        ];

        return response()->json(["status" => true, "message" => "", "data" => $finalData]);
    }

    public function showAssessmentScores (string $id) {

        $assessmentScores = Assessment::with("questions")->find($id);

        if (!$assessmentScores) return response()->json(["status" => false, "message" => "No such assessment in system !"], 404);

        $assessmentScores->questions->map(function ($q) {
            $q->score = $q->pivot->score;
            unset(
                $q->group,
                $q->description,
                $q->created_at,
                $q->updated_at,
                $q->pivot
            );

            return $q;
        });

        unset(
            $assessmentScores->id,
            $assessmentScores->enact_id
        );

        return response()->json(["status" => true, "message" => "", "data" => $assessmentScores], 200);

    }

    public function destroy (Request $request)
    {
        $validated = $request->validate([
            "ids" => "required|array",
            "ids.*" => "required|integer"
        ]);

        $ids = $validated["ids"];

        Enact::whereIn("id", $ids)->delete();

        return response()->json(["status" => false, "message" => "Assessments successfully deleted !"], 200);
    }

    public function destroyAssessment(string $id) {
        $assessment = Assessment::find($id);

        if (!$assessment) return response()->json(["status" => false, "message" => "No such assessment in system !"], 404);

        $assessment->forceDelete();

        return response()->json(["status" => true, "message" => "Assessment successfully deleted !"], 200);
    }

    public function assessAssessment(Request $request)
    {
        $enact = Enact::findOrFail($request->enactId);
        $scores = $request->input('scores');
        $date = $request->input("date");
        
        $questionIds = Question::all()->pluck("id");

        $assessment = $enact->assessments()->create([
            "totalScore" => 0,
            "date" => $date
        ]);

        $totalScore = 0;
        $pivotData = [];

        foreach ($questionIds as $questionId) {
            // دریافت نمره با استفاده مستقیم از شناسه واقعی سوال
            $score = (int) ($scores[$questionId] ?? 0);

            $pivotData[$questionId] = ['score' => $score];
            $totalScore += $score;
        }

        $assessment->update([
            "totalScore" => $totalScore
        ]);

        $assessment->questions()->syncWithoutDetaching($pivotData);

        return response()->json(['message' => 'Scores saved successfully']);
    }

    public function updateAssessment(Request $request, string $assessmentId)
    {
        $request->validate([
            "scores" => "required|array",
            "scores.*" => "required|integer|min:0",
            "date" => "required|date",
        ]);

        $assessment = Assessment::with("questions")->findOrFail($assessmentId);

        $scores = $request->input("scores");
        $date = $request->input("date");

        $totalScore = 0;
        $pivotData = [];

        foreach ($scores as $questionId => $score) {
            $pivotData[$questionId] = [
                "score" => $score
            ];

            $totalScore += (int) $score;
        }

        // update assessment main data
        $assessment->update([
            "totalScore" => $totalScore,
            "date" => $date
        ]);

        // overwrite pivot data (important!)
        $assessment->questions()->sync($pivotData);

        return response()->json([
            "status" => true,
            "message" => "Assessment updated successfully"
        ]);
    }


} 