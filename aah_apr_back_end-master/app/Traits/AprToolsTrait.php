<?php

namespace App\Traits;

use App\Models\Beneficiary;
use App\Models\Project;

trait AprToolsTrait
{
    protected function projectProgramsIds (Project $project)
    {
        return $project->programs()->pluck("id")->toArray();
    }

    protected function projectIndicatorsToASpicificDatabase(Project $project, string $databaseId)
    {

        $indicators = $project->outcomes->flatMap(function ($outcome) use ($databaseId) {

            return $outcome->outputs;

        })->flatMap(function ($output) use($databaseId) {

            if ($databaseId == "*") {

                return $output->indicators;

            }

            return $output->indicators->where("database_id", $databaseId);
            
        });

        return $indicators;
    }

    protected function projectIndicatorsToASpicificDatabaseReal(Project $project, string $databaseId)
    {

        $indicators = $project->outcomes->flatMap(function ($outcome) {

            return $outcome->outputs;

        })->flatMap(function ($output) use($databaseId) {

            return $output->indicators->where("database_id", $databaseId);
            
        });

        return $indicators;
    }

    protected function projectIndicatorsWithDessaggregations(Project $project, string $databaseId)
    {

        $indicators = $project->outcomes->flatMap(function ($outcome) {

            return $outcome->outputs;

        })->flatMap(function ($output) {

            return $output->indicators()->with("dessaggregations")->get();
            
        });

        return $indicators;
    }


    protected function projectOutputsToASpicificDatabase (Project $project, string $databaseId)
    {

        $projectIndicators = $this->projectIndicatorsToASpicificDatabase($project, $databaseId);

        $outputs =  $projectIndicators->filter(function ($indicator) {
            return $indicator->parent_indicator == null;
        })->map(function ($indicator) use ($project) {

            $output = $project->outputs->where("id", $indicator->output_id)->first();

            return $output;
        });

        return $outputs->filter();
    }

    protected function projectOutcomesToASpicificDatabase (Project $project, string $databaseId)
    {

        $projectOutputs = $this->projectOutputsToASpicificDatabase($project, $databaseId);

        $outcomes = $projectOutputs->map(function ($output) use ($project) {

            $outcome = $project->outcomes->where("id", $output->outcome_id)->first();

            return $outcome;
        });

        return $outcomes;
    }

    protected function projectBeneficiariesToASpicificDatabaseAndSpicificProvince 
    (Project $project, string $databaseId, string $provinceId)
    {

        $projectPrograms = $this->projectProgramsIds($project);

        $beneficiaries = Beneficiary::whereHas('programs', function ($query) use ($projectPrograms, $databaseId, $provinceId) {
            $query
                ->whereIn('programs.id', $projectPrograms)
                ->where('programs.province_id', $provinceId)
                ->where('database_program_beneficiary.database_id', $databaseId);
        })->get();

        return $beneficiaries;
    }
}
