<?php

namespace App\Http\Controllers;

use App\Http\Requests\PsychoeducationFormRequest;
use App\Models\Database;
use App\Models\Program;
use App\Models\Project;
use App\Models\Psychoeducations;
use Illuminate\Http\Request;

class PsychoeducationDatabaseController extends Controller
{
    public function index(Request $request)
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
                'indicator',
                'program' => function ($q) use ($psychoeducationDatabaseID, $request) {
                    $q->where('database_id', $psychoeducationDatabaseID)
                    ->with(['project', 'province', 'district'])

                    ->when($request->filled('projectCode'),
                        fn ($x) => $x->whereHas('project',
                            fn ($p) => $p->whereIn('id', (array) $request->input('projectCode'))
                        )
                    )

                    ->when($request->filled('focalPoint'),
                        function ($x) use ($request) {
                            $focalPoints = explode(",", $request->input("focalPoint"));
                            $x->whereIn('focalPoint', $focalPoints);
                        }
                    )

                    ->when($request->filled('province'),
                        fn ($x) => $x->whereHas('province',
                            fn ($p) => $p->whereIn("id", (array) $request->input("province"))
                        )
                    )

                    ->when($request->filled('siteCode'),
                        function ($x) use ($request) {
                            $siteCodes = explode(",", $request->input("siteCode"));
                            $x->whereIn('siteCode', $siteCodes);
                        }
                    )

                    ->when($request->filled('healthFacilityName'),
                        function ($x) use ($request) {
                            $hf = explode(',', $request->input("healthFacilitator"));
                            $x->whereIn('healthFacilityName', $hf);
                        }
                    )

                    ->when($request->filled('interventionModality'),
                        function ($x) use ($request) {
                            $im = explode(',', $request->input("interventionModality"));
                            $x->whereIn('interventionModality', $im);
                        }
                    );
                }
            ])
            ->whereHas('program', fn ($q) =>
                $q->where('database_id', $psychoeducationDatabaseID)
            );

        if ($request->filled('indicator')) {
            $query->whereHas('indicator', function ($q) use ($request) {
                $q->whereIn('indicators.id', (array) $request->input("indicator"));
            });
        }

        if ($request->filled('awarenessDate')) {
            $dates = explode(",", $request->input('awarenessDate'));
            $query->where(function ($q) use ($dates) {
                foreach ($dates as $date) {
                    $q->orWhere("awarenessDate", $date);
                }
            });
        }

        if ($search = $request->input('search')) {
            $topics = explode(',', $request->input('search'));
            $query->where(function ($q) use ($topics) {
                foreach ($topics as $topic) {
                    $q->orWhere('awarenessTopic', $topic);
                }
            });
        }

        $perPage = $request->integer("perPage", 10);
        $order = $request->str("order", "desc");

        $psychoeducations = $query->orderBy("created_at", $order)->paginate($perPage);

        if ($psychoeducations->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No psychoeducation found!",
                "data" => [],
            ], 200);
        }

        $psychoeducations->getCollection()->transform(function ($p) {
            return [
                "id" => $p->id,
                "programName" => $p->program?->name,
                "projectCode" => $p->program?->project?->projectCode,
                "province" => $p->program?->province?->name,
                "district" => $p->program?->district?->name,
                "indicator" => $p->indicator?->indicatorRef,
                "awarenessDate" => $p->awarenessDate,
            ];
        });

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $psychoeducations
        ]);
    }

    public function store (PsychoeducationFormRequest $request)
    {

        $psychoeducationDatabase = Database::where("name", "psychoeducation_database")->first();

        if (!$psychoeducationDatabase) return response()->json(["status" => false, "message" => "Psychoeducation is not a database !"], 404);

        $psychoeducationDatabaseId = $psychoeducationDatabase->id;

        $programInformations = $request->input("programInformation");

        $project = Project::find($programInformations["project_id"]);

        if (!$project)
            return response()->json(["status" => false, "message" => "No such project in system !", "data" => []], 404);

        $awarenessDate = $request->input("psychoeducationInformation")["awarenessDate"];

        if ($awarenessDate > $project->endDate || $awarenessDate < $project->startDate)
            return response()->json(["status" => false, "message" => "Awareness date should not be out of project date range !"], 422); 

        $indicatorId = $programInformations["indicator_id"];
 
        $programInformations["database_id"] = $psychoeducationDatabaseId;

        $program = Program::create($programInformations);

        $psychoeducationInformations = $request->input("psychoeducationInformation");

        $psychoeducationInformations["indicator_id"] = $indicatorId;

        $program->psychoeducation()->updateOrCreate($psychoeducationInformations);

        return response()->json(["status" => false, "message" => "Psychoeducation successfully created !"], 200);
    }

    public function show (string $id)
    {
        $psychoeducation = Psychoeducations::find($id);

        if (!$psychoeducation) return response()->json(["status" => false, "message" => "No such psychoeducation in system !"], 404);

        $program = $psychoeducation->program;

        $program["indicator_id"] = $psychoeducation["indicator_id"];

        $finalData = [
            "programData" => $program,
            "psychoeducationData" => $psychoeducation,
        ];

        return response()->json(["status" => true, "message" => "", "data" => $finalData]);

        
    }

    public function update(PsychoeducationFormRequest $request, $id)
    {
        $psychoeducation = Psychoeducations::find($id);
        if (!$psychoeducation) {
            return response()->json([
                "status" => false,
                "message" => "No such psychoeducation in system!"
            ], 404);
        }

        $programInformations = $request->input("programInformation");
        $indicatorId = $programInformations["indicator_id"];

        $program = $psychoeducation->program;
        if ($program) {
            $program->update($programInformations);
        } else {
            $psychoeducationDatabase = Database::where("name", "psychoeducation_database")->first();
            if (!$psychoeducationDatabase) {
                return response()->json([
                    "status" => false,
                    "message" => "Psychoeducation is not a database!"
                ], 404);
            }
            $programInformations["database_id"] = $psychoeducationDatabase->id;
            $program = Program::create($programInformations);
            $psychoeducation->program_id = $program->id;
        }

        $psychoeducationInformations = $request->input("psychoeducationInformation");
        $psychoeducationInformations["indicator_id"] = $indicatorId;

        $psychoeducation->update($psychoeducationInformations);

        return response()->json([
            "status" => true,
            "message" => "Psychoeducation successfully updated!"
        ], 200);
    }


    public function destroy (Request $request)
    {
        $ids = $request->input("ids");

        $request->validate([
            "ids" => "required|array",
            "ids.*" => "integer"
        ]);

        Psychoeducations::whereIn("id", $ids)->delete();

        return response()->json(["status" => true, "message" => "Psychoeducations successfully deleted !"], 200);
    }
}
