<?php

namespace App\Services;

use App\Constants\PaginationConfig;
use App\Constants\System;
use App\DTOs\IndexProjectDTO;
use App\DTOs\ProjectDateRangeDTO;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\Project;
use App\Services\ProgramServices\ProgramService;

class ProjectService {

    public function getProjects (IndexProjectDTO $dto): LengthAwarePaginator | string {

        $query = Project::query();

        foreach ($dto->useFilters() as $filterKey => $filterValue) {
            $query->when($filterKey, fn($q) => $q->where($filterKey, "like", "%" . $filterValue . "%"));
        }

        $query->when($dto->search, fn($q) => $q->where("projectCode", "like", "%" . $dto->search . "%"));

        $projects = $query->paginate(PaginationConfig::PROJECTS_PER_PAGE);

        return $projects;

    }

    public function getProjectDateRange (string $id): ProjectDateRangeDTO | string {

        $project = Project::find($id);

        if (!$project) return System::SYSTEM_PROJECT_404;

        $startDate = $project->startDate->toDateString();
        $endDate = $project->endDate->toDateString();

        return new ProjectDateRangeDTO(
            $startDate,
            $endDate
        );
    } 

    public function getProjectDateRangeAccToProgram (string $id, ProgramService $programService = new ProgramService()): ProjectDateRangeDTO | string {

        $program = $programService->getProgram($id);

        if ($program == System::SYSTEM_PROGRAM_404)
            return System::SYSTEM_PROGRAM_404;

        $projectId = $program->project_id;

        $dto = $this->getProjectDateRange($projectId);

        if ($dto == System::SYSTEM_PROJECT_404) 
            return System::SYSTEM_PROJECT_404;

        return $dto;
    }


}