<?php

namespace App\Constants;

use Symfony\Component\HttpFoundation\JsonResponse;

class RequestResponses {

    private static string $successDefaultMessage = "Process successfully done !";

    private static string $notFoundDefaultMessage = "No such record in database !";

    private static string $invalidInputDefaultMessage = "Invalid input please try again";

    public static function success (?string $message = null, mixed $data = null): JsonResponse {
        return response()->json(["status" => true, "message" => $message ?? static::$successDefaultMessage, "data" => $data ?? []], 200);
    }

    public static function notFound404 (?string $message = null, mixed $data = null): JsonResponse {
        return response()->json(["status" => false, "message" => $message ?? static::$notFoundDefaultMessage, "data" => $data ?? []], System::NO_RECORDS_STATUS_CODE);
    }

    public static function invalidInput (?string $message = null, mixed $data = null): JsonResponse {
        return response()->json(["status" => System::INVALID_INPUT_STATUS, "message" => $message ?? static::$invalidInputDefaultMessage, "data" => $data ?? []], System::INVALID_INPUT_CODE);
    }

}