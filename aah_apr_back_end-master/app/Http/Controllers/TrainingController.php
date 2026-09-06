<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddTrainingToBeneficiaryRequest;
use App\Http\Requests\StoreChapterRequest;
use App\Http\Requests\StorePreAndPostTestRequest;
use App\Http\Requests\StoreTrainingBeneficiaryRequest;
use App\Http\Requests\StoreTrainingRequest;
use App\Models\Beneficiary;
use App\Models\Chapter;
use App\Models\Database;
use App\Models\DatabaseProgramBeneficiary;
use App\Models\District;
use App\Models\Indicator;
use App\Models\Project;
use App\Models\Province;
use App\Models\Training;
use App\Models\TrainingEvaluation;
use Illuminate\Http\Request;
use App\Jobs\AttachBeneficiariesToTrainingChapters;
use Illuminate\Support\Facades\Auth;


class TrainingController extends Controller
{
    public function index(Request $request)
    {
        $query = Training::query()
            ->with([
                'indicator',
            ]);

        $query->when($request->filled('projectCode'), fn($q) =>
            $q->whereHas('project', fn($p) =>
                $p->whereIn('project_id', $request->input('projectCode'))
            )
        );

        $query->when($request->filled('indicatorRef'), fn($q) =>
            $q->whereHas('indicator', fn($i) =>
                $i->whereIn('indicators.id', $request->input('indicatorRef'))
            )
        );

        $query->when($request->filled('province'), fn($q) =>
            $q->whereIn('province_id', $request->province)
        );

        if ($request->input('search')) {
            $names = explode(',', $request->input('search'));
            $query->whereIn('name', $names);
        }

        $perPage = $request->integer("perPage", 10);
        $order = $request->str("order", "desc");

        $trainings = $query->orderBy("created_at", $order)->paginate($perPage);

        if ($trainings->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No training was found!",
                "data" => []
            ], 200);
        }

        $trainings->getCollection()->transform(function ($training) {

            $tempProject = $training->project;
            $tempProvince = $training->province;
            $tempDistrict = $training->district;
            $tempIndicator = $training->indicator;
            
            unset($training->project, $training->province, $training->district, $training->indicator);

            $training->projectCode = $tempProject?->projectCode;
            $training->province = $tempProvince?->name;
            $training->district = $tempDistrict?->name;
            $training->indicator = $tempIndicator?->indicator;

            return $training;
        });


        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $trainings
        ]);
    }

    public function indexBeneficiaries (Request $request)
    {

        $trainingDbId = Database::where("name", "training_database")->pluck("id");

        $trainingBeneficiaries = DatabaseProgramBeneficiary::where("database_id", $trainingDbId)->pluck("beneficiary_id")->toArray();

        $query = Beneficiary::query()
            ->with(['trainings']);

        $query->whereIn("id", $trainingBeneficiaries);
        
        if ($request->filled('projectCode') || $request->filled('province') || $request->filled('indicator')) {

            $query->whereHas('trainings', function($q) use ($request) {

                if ($request->filled('projectCode')) {
                    $q->whereHas('project', function($q2) use ($request) {
                        $q2->whereIn('projects.id', $request->input('projectCode'));
                    });
                }

                if ($request->filled('province')) {
                    $q->whereHas('province', function ($q) use ($request) {
                        $q->whereIn("provinces.id", $request->input('province'));
                    });
                }

                if ($request->filled('indicator')) {
                    $q->whereHas("indicator", function ($q) use ($request) {
                        $q->where("indicators.id", $request->input('indicator'));
                    });
                }

            });
        }
        
        if ($request->filled('dateOfRegistration')) {
            $dates = $request->input('dateOfRegistration');
            $query->whereIn('dateOfRegistration', $dates);
        }

        if ($request->filled('age')) {
            $ages = explode(',', $request->input('age'));
            $query->whereIn('age', $ages);
        }

        if ($request->filled('gender')){
            $genders = explode(',', $request->input('gender'));
            $query->whereIn("gender", $genders);
        }

        if ($request->input('search')) {
            $namesORCodes = explode(',', $request->input('search'));
            $query->where(function ($q) use ($namesORCodes) {
                foreach ($namesORCodes as $nameOrCode) {
                    $q->orWhere('code', 'like', '%' . $nameOrCode . '%')
                        ->orWhere('fatherHusbandName', 'like', '%' . $nameOrCode . '%')
                        ->orWhere('name', 'like', '%' . $nameOrCode . '%');
                } 
            });
        }

        if ($request->filled('code')) {
            $codes = explode(',', $request->input('code'));
            $query->whereIn("code", $codes);
        }

        $perPage = $request->integer("perPage", 10);
        $order = $request->str("order", "desc");

        $beneficiaries = $query->orderBy("created_at", $order)->paginate($perPage);

        if ($beneficiaries->isEmpty()) return response()->json(["status" => false, "message" => "No beneficiary was found !", "data" => []], 200);

        return response()->json(["status" => true, "message" => "", "data" => $beneficiaries]);
    }

    public function indexBeneficiaryTrainings(string $id)
    {
        $beneficiary = Beneficiary::with("trainings.chapters")
            ->select(
                "id",
                "name",
                "fatherHusbandName",
                "gender",
                "age",
                "phone",
                "email",
                "participantOrganization",
                "jobTitle",
                'dateOfRegistration',
                "code"
            )
            ->find($id);

        if (! $beneficiary) {
            return response()->json([
                "status" => false,
                "message" => "No such beneficiary in system !"
            ], 404);
        }

        $beneficiaryChapters = $beneficiary->chapters()
            ->select("chapters.id")
            ->get()
            ->map(function ($chapter) {
                return [
                    "id" => $chapter->pivot->chapter_id,
                    "isPresent" => (bool) $chapter->pivot->isPresent,
                    "preTestScore" => $chapter->pivot->preTestScore,
                    "postTestScore" => $chapter->pivot->postTestScore,
                ];
            });

        $beneficiary->trainings->map(function ($training) {
            $training->aprIncluded = (bool) $training->aprIncluded;

            $training->district = Province::find($training->province_id)?->name ?? null;
            $training->projectCode = Project::find($training->project_id)?->projectCode ?? null;
            $training->indicator = Indicator::find($training->indicator_id)?->indicator ?? null;

            unset(
                $training->project_id,
                $training->district_id,
                $training->province_id,
                $training->indicator_id,
                $training->created_at,
                $training->updated_at,
                $training->pivot
            );

            $training->chapters->map(function ($chapter) {
                unset($chapter->training_id, $chapter->created_at, $chapter->updated_at);
                return $chapter;
            });

            return $training;
        });

        $beneficiary->selfChapters = $beneficiaryChapters;

        unset($beneficiary->id);

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $beneficiary
        ]);
    }

    public function indexTrainingBeneficiaries(Request $request, string $id)
    {

        $training = Training::find($id);

        if (!$training) return response()->json(["status" => false, "message" => "No such training in system !", "data" => []], 404);

        $query = $training->beneficiaries();

        if ($request->filled('age')) {
            $ages = explode(',', $request->input('age'));
            $query->whereIn('age', $ages);
        }

        if ($request->filled('gender')){
            $genders = $request->input('gender');
            $query->whereIn("gender", $genders);
        }

        if ($request->input('search')) {
            $nameOrCodes = $request->input('search');
            $query->where(function ($q) use ($nameOrCodes) {
                foreach ($nameOrCodes as $nameOrCode) {
                    $q->orWhere('code', 'like', '%' . $nameOrCode . '%')
                        ->orWhere('name', 'like', '%' . $nameOrCode . '%');
                }
            });
        }

        $perPage = $request->integer("perPage", 10);
        $order = $request->str("order", "desc");

        $beneficiaries = $query->orderBy("created_at", $order)->paginate($perPage);

        if ($beneficiaries->isEmpty()) return response()->json(["status" => false, "message" => "No beneficiary was found !", "data" => []], 200);

        return response()->json(["status" => true, "message" => "", "data" => $beneficiaries]);

    }

    public function indexTrainingsForSelection ()
    {
        $trainings = Training::select("id", "name")->get();

        if ($trainings->isEmpty()) return response()->json(["status" => false, "message" => "No such training in system !"], 404);

        return response()->json(["status" => true, "message" => "", "data" => $trainings]);
    }

    public function store (StoreTrainingRequest $request)
    {

        $validated = $request->except("chapters");

        $training = Training::create($validated);

        $chapters = $request->input("chapters");

        foreach ($chapters as $chapter) {

            $training->chapters()->create($chapter);

        }

        return response()->json(["status" => true, "message" => "Training successfully created !"], 200);
    }

    public function storeNewChapter (StoreChapterRequest $request, string $id)
    {
        $validated = $request->validated();

        $training = Training::find($id);

        if (!$training) return response()->json(["status" => false, "message" => "No such training in system !"], 404);

        $chapter = $training->chapters()->create($validated);

        AttachBeneficiariesToTrainingChapters::dispatch(
            $training,
            Auth::id()
        );

        return response()->json(["status" => true, "message" => "Chapter successfully created !,  now the system will attach the new chapter to training beneficiaries. We will notify you once the process is done.", "data" => $chapter], 200);
    }

    public function storeNewBeneficiary (StoreTrainingBeneficiaryRequest $request)
    {
        $validated = $request->validated();

        $trainingDb = Database::where("name", "training_database")->first();

        if (!$trainingDb) return response()->json(["status" => false, "message" => "Training database is not in system !"], 404);

        $trainingDbId = $trainingDb->id;

        $validated["aprIncluded"] = true;

        $beneficiary = Beneficiary::create($validated);

        DatabaseProgramBeneficiary::create([
            "database_id" => $trainingDbId,
            "beneficiary_id" => $beneficiary->id,
        ]);

        return response()->json(["status" => true, "message" => "Beneficiary successfully created !", "data" => []], 200);
    }

    public function update(StoreTrainingRequest $request, string $id)
    {
        $training = Training::find($id);

        if (!$training)
            return response()->json([
                "status" => false,
                "message" => "No such training found!"
            ], 404);

        $validated = $request->except("chapters");

        $training->update($validated);

        $chapters = $request->input("chapters", []);

        foreach ($chapters as $chapter) {
            $training->chapters()->updateOrCreate($chapter);
        }

        AttachBeneficiariesToTrainingChapters::dispatch(
            $training,
            Auth::id()
        );

        return response()->json([
            "status" => true,
            "message" => "Training successfully updated!, now the system will attach all new chapters to training beneficiaries. We will notify you once the process is done."
        ], 200);
    }
    
    public function updateBeneficiary(StoreTrainingBeneficiaryRequest $request, string $id)
    {
        $validated = $request->validated();

        $beneficiary = Beneficiary::find($id);

        if (!$beneficiary) {
            return response()->json([
                "status" => false,
                "message" => "No such beneficiary found in the system!"
            ], 404);
        }

        $beneficiary->update($validated);

        $trainingDb = Database::where("name", "training_database")->first();
        if ($trainingDb) {
            DatabaseProgramBeneficiary::updateOrCreate(
                [
                    "beneficiary_id" => $beneficiary->id,
                    "database_id" => $trainingDb->id,
                ],
                [] 
            );
        }

        return response()->json([
            "status" => true,
            "message" => "Beneficiary successfully updated!",
            "data" => $beneficiary
        ], 200);
    }

    public function updateChapter(StoreChapterRequest $request, string $id)
    {

        $chapter = Chapter::find($id);

        if (!$chapter) return response()->json(["status" => false, "message" => "No such chapter in system !", "data" => []], 404);

        $validated = $request->validated();

        $chapter->update($validated);

        return response()->json(["status" => true, "message" => "Chapter successfully updated !", "data" => []], 200);

    }

    public function showTrainingForEdit (string $id)
    {

        $training = Training::with(["chapters", "evaluations"])->find($id);

        if (!$training)
            return response()->json([
                "status" => false,
                "message" => "No such training in system !"
            ], 404);

        $training->makeHidden([
            "created_at",
            "updated_at"
        ]);

        $training["aprIncluded"] = (bool) $training->aprIncluded;

        $training->chapters = $training->chapters->map(function ($chapter) {
            unset($chapter->created_at, $chapter->updated_at, $chapter->training_id);
            return $chapter;
        });

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $training
        ]);

    }

    public function show(string $id)
    {
        $training = Training::with(["chapters", "evaluations"])->find($id);

        if (!$training)
            return response()->json([
                "status" => false,
                "message" => "No such training in system !"
            ], 404);

        $training->makeHidden([
            "created_at",
            "updated_at"
        ]);

        $training["projectCode"] = Project::find($training->project_id)?->projectCode;
        $training["indicatorRef"] = Indicator::find($training->indicator_id)?->indicatorRef;
        $training["province"] = Province::find($training->province_id)?->name;
        $training["district"] = District::find($training->district_id)?->name;
        $training["aprIncluded"] = (bool) $training->aprIncluded;

        unset(
            $training["project_id"],
            $training["province_id"],
            $training["district_id"],
            $training["indicator_id"],
        );

        $training->chapters = $training->chapters->map(function ($chapter) {
            unset($chapter->created_at, $chapter->updated_at, $chapter->training_id);
            return $chapter;
        });

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $training
        ]);
    }

    public function showBeneficiary(string $id)
    {
        $beneficiary = Beneficiary::find($id);

        if (!$beneficiary) {
            return response()->json([
                "status" => false,
                "message" => "No such beneficiary found in the system!"
            ], 404);
        }

        $data = [
            "id" => $beneficiary->id,
            "name" => $beneficiary->name,
            "fatherHusbandName" => $beneficiary->fatherHusbandName,
            "gender" => $beneficiary->gender,
            "age" => $beneficiary->age,
            "phone" => $beneficiary->phone,
            "email" => $beneficiary->email,
            "code" => $beneficiary->code,
            "participantOrganization" => $beneficiary->participantOrganization,
            "jobTitle" => $beneficiary->jobTitle,
            "dateOfRegistration" => $beneficiary->dateOfRegistration,
        ];

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $data
        ], 200);
    }

    public function showChapter(string $id)
    {

        $chapter = Chapter::find($id);

        if (!$chapter) return response()->json(["status" => false, "message" => "No such chapter in system !", "data" => []]);

        unset($chapter->training_id);

        return response()->json(["status" => true, "message" => "", "data" => $chapter], 200);

    }

    public function destroy (Request $request)
    {
        
        $request->validate([
            "ids" => "required|array",
            "ids.*" => "integer"
        ]);
        
        $ids = $request->input("ids");

        Training::whereIn("id", $ids)->delete();

        return response()->json(["status" => true, "message" => "Trainings successfully deleted !"], 200);
    } 

    public function destroyBeneficiaries (Request $request)
    { 
        $request->validate([
            "ids" => "required|array",
            "ids.*" => "integer"
        ]);
        
        $ids = $request->input("ids");

        Beneficiary::whereIn("id", $ids)->delete();

        return response()->json(["status" => true, "message" => "Trainings successfully deleted !"], 200);
    }

    public function destroyChapter (string $id)
    {

        $chapter = Chapter::find($id);

        if (!$chapter) return response()->json(["status" => false, "message" => "No such chapter in system !", "data" => []], 404);

        $chapter->delete();

        return response()->json(["status" => true, "message" => "Chapter successfully deleted !", "data" => []], 200);

    }

    public function addTrainingToBeneficiaries (AddTrainingToBeneficiaryRequest $request)
    {
        $validated = $request->validated();

        $training = Training::find($validated["training"]);

        if (!$training) return response()->json(["status" => false, "message" => "No such training in system !"], 404);

        $beneficiariesIds = $validated["ids"];

        $training->beneficiaries()->syncWithoutDetaching($beneficiariesIds);

        $trainingChaptersIds = $training->chapters()->pluck("id")->toArray();

        foreach ($beneficiariesIds as $beneficiaryId) {
            $beneficiary = Beneficiary::find($beneficiaryId);

            $beneficiary->chapters()->attach($trainingChaptersIds);
        }

        return response()->json(["status" => true, "message" => "Training " . $training->name . " successfully assigned to " . (string) count($beneficiariesIds) . " beneficiaries !"], 200);
    }

    public function togglePresence (string $beneficiaryId, string $chapterId)
    {
        $beneficiary = Beneficiary::find($beneficiaryId);

        if (!$beneficiary) return response()->json(["status" => false, "message" => "No such beneficiary in system !"], 404);

        $chapter = Chapter::find($chapterId);

        if (!$chapter) return response()->json(["status" => false, "message" => "No such chapter in system !"], 404);

        $currentPivot = $beneficiary->chapters()
                                    ->where("chapters.id", $chapterId)
                                    ->first()
                                    ->pivot;

        $newStatus = !$currentPivot->isPresent;

        $beneficiary->chapters()->updateExistingPivot($chapterId, [
            "isPresent" => $newStatus
        ]);

        return response()->json(["status" => true, "message" => "The precense status of beneficiary changed to " . (string) ($newStatus ? "true" : "false")], 200);

    }

    public function setPreAndPostTest (StorePreAndPostTestRequest $request, string $beneficiaryId, string $chapterId)
    {

        $validated = $request->validated();

        $beneficiary = Beneficiary::find($beneficiaryId);

        if (!$beneficiary) return response()->json(["status" => false, "message" => "No such beneficiary in system !"], 404);

        $chapter = Chapter::find($chapterId);

        if (!$chapter) return response()->json(["status" => false, "message" => "No such chapter in system !"], 404);

        $newPreTestScore = $validated["preTestScore"];
        $newPostTestScore = $validated["postTestScore"];
        $newRemark = $validated["remark"];

        $beneficiary->chapters()->updateExistingPivot($chapterId, [
            "preTestScore" => $newPreTestScore,
            "postTestScore" => $newPostTestScore,
            "remark" => $newRemark
        ]);

        return response()->json(["status" => true, "message" => "Pre Test And Post Test successfully updated"], 200);
    }

    public function showBeneficiaryChapterPreAndPostTestScores (string $beneficiaryId, string $chapterId)
    {
        $beneficiary = Beneficiary::find($beneficiaryId);

        if (!$beneficiary) return response()->json(["status" => false, "message" => "No such beneficiary in system !"], 404);

        $chapter = Chapter::find($chapterId);

        if (!$chapter) return response()->json(["status" => false, "message" => "No such chapter in system !"], 404);

        $chapter = $beneficiary->chapters()
                                ->where("chapters.id", $chapterId)
                                ->first();

        $data = [
            "preTestScore" => $chapter->pivot->preTestScore,
            "postTestScore" => $chapter->pivot->postTestScore,
            "remark" => $chapter->pivot->remark
        ];

        return response()->json(["status" => true, "message" => "", "data" => $data]);

    }

    public function storeTrainingEvaluation(Request $request, string $trainingId)
    {
        $training = Training::find($trainingId);

        if (!$training) {
            return response()->json([
                "status" => false,
                "message" => "No such training in system !",
                "data" => []
            ], 404);
        }

        $validated = $request->validate([
            "evaluations" => "required|array",
            "evaluations.*.participant" => "nullable|string|max:100",
            "evaluations.*.selected" => "nullable|string|in:informative,usefulness,understanding,relevance,applicability",
            "remark" => "nullable|string",
        ]);

        TrainingEvaluation::updateOrCreate(
            [
                "training_id" => $trainingId
            ],
            [
                "evaluations" => $validated["evaluations"],
                "remark" => $validated["remark"] ?? null,
            ]
        );

        return response()->json([
            "status" => true,
            "message" => "Evaluation successfully saved !",
            "data" => []
        ], 200);
    }

    public function showTrainingEvaluation (string $trainingId)
    {
        $training = Training::find($trainingId);

        if (!$training) return response()->json(["status" => false, "message" => "No such training in system !"], 404);

        
    }

    public function removeBeneficiariesFromTraining(Request $request, string $trainingId)
    {
        $training = Training::find($trainingId);

        if (!$training) {
            return response()->json([
                "status" => false,
                "message" => "No such training in system !",
                "data" => []
            ], 404);
        }

        $request->validate([
            "ids" => "required|array",
            "ids.*" => "integer|exists:beneficiaries,id",
        ]);

        $beneficiaryIds = $request->input("ids");

        // Get all beneficiaries currently attached to this training
        $currentBeneficiaryIds = $training
            ->beneficiaries()
            ->pluck("beneficiaries.id")
            ->toArray();

        // Keep beneficiaries that are NOT in the removal list
        $remainingBeneficiaryIds = array_values(
            array_diff($currentBeneficiaryIds, $beneficiaryIds)
        );

        // Sync only the remaining beneficiaries
        $training->beneficiaries()->sync($remainingBeneficiaryIds);

        return response()->json([
            "status" => true,
            "message" => "Selected beneficiaries successfully removed !",
            "data" => []
        ], 200);
    }

    public function removeTrainingFromBeneficiary(Request $request) 
    {

        $validated = $request->validate([
            "trainingId" => "required|numeric",
            "beneficiaryId" => "required|numeric"
        ]);

        $beneficiary = Beneficiary::find($validated["beneficiaryId"]);

        if (!$beneficiary) return response()->json(["status" => false, "message" => "No such beneficiary in systme !", "data" => []], 404);

        $beneficiary->trainings()->sync(array_filter([$beneficiary->trainings()->pluck("trainings.id")->toArray()], function ($value) use ($validated) {
            $value != $validated["trainingId"];
        }));

        return response()->json(["status" => true, "message" => "Training successfully removed from beneficiary !", "data" => []], 200);

    }
}
