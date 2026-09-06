<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboardService
    ) {}

    public function index(Request $request): JsonResponse
    {
        error_log(123);
        $validated = $request->validate([
            'project_id' => [
                'nullable',
                'integer',
                'exists:projects,id',
            ],

            'province_id' => [
                'nullable',
                'integer',
                'exists:provinces,id',
            ],

            'database_id' => [
                'nullable',
                'integer',
                'exists:databases,id',
            ],

            'from' => [
                'nullable',
                'date',
            ],

            'to' => [
                'nullable',
                'date',
                'after_or_equal:from',
            ],
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->dashboardService->getDashboard(
                $validated
            ),
        ]);
    }
}