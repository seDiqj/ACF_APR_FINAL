<?php

namespace App\DTOs;


class IndexProjectDTO {

    public function __construct(
        public string | null $projectCode,
        public string | null $projectManager,
        public string | null $startDate,
        public string | null $endDate,
        public string | null $reportingDate,
        public string | null $status,
        public string | null $aprStatus,
        public string | null $projectTitle,
        public string | null $projectDonor,
        public string | null $projectGoal,
        public string | null $search
    ) {}

    public function useFilters (): array {

        return [
            "projectCode" => $this->projectCode,
            "projectManager" => $this->projectManager,
            "startDate" => $this->startDate,
            "endDate" => $this->endDate,
            "reportingDate" => $this->reportingDate,
            "status" => $this->status,
            "aprStatus" => $this->aprStatus,
            "projectTitle" => $this->projectTitle,
            "projectDonor" => $this->projectDonor,
            "projectGoal" => $this->projectGoal,
        ];

    }

}