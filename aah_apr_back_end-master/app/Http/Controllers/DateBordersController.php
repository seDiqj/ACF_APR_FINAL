<?php

namespace App\Http\Controllers;

use App\Constants\RequestResponses;
use App\Constants\ResponseMessages;
use App\Constants\System;
use App\Services\ProjectService;
use Symfony\Component\HttpFoundation\JsonResponse;

class DateBordersController extends Controller
{
    
    public function projectDateRange (string $id, ProjectService $service): JsonResponse {

        $dto = $service->getProjectDateRange($id);

        if ($dto == System::SYSTEM_404) 
            return RequestResponses::notFound404(ResponseMessages::PROJECT_NOT_FOUND);
        
        $finalData = [
            "start" => $dto->startDate,
            "end" => $dto->endDate,
        ];

        return RequestResponses::success(null, $finalData);

    }

    public function projectDateRangeAccToProgram (string $id, ProjectService $service): JsonResponse {

        $dto = $service->getProjectDateRangeAccToProgram($id);

        if ($dto == System::SYSTEM_PROGRAM_404)
            return RequestResponses::notFound404(ResponseMessages::PROGRAM_NOT_FOUND);
        else if ($dto == System::SYSTEM_PROJECT_404)
            return RequestResponses::notFound404(ResponseMessages::PROJECT_NOT_FOUND);

        $finalData = [
            "start" => $dto->startDate,
            "end" => $dto->endDate,
        ];

        return RequestResponses::success(null, $finalData);

    }


}
