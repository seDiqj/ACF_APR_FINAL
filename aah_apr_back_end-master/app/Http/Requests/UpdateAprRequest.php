<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAprRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            "project_id"   => ["required", "exists:projects,id"],
            "database_id"  => ["required", "exists:databases,id"],
            "province_id"  => ["required", "exists:provinces,id"],
            "manager_id"   => ["required", "exists:users,id"],

            "fromDate"     => ["required", "date"],
            "toDate"       => ["required", "date", "after_or_equal:fromDate"],

            "comment"      => ["nullable", "string", "max:1000"],
        ];
    }

    public function messages(): array
    {
        return [
            "project_id.required"  => "Project is required.",
            "project_id.exists"    => "Selected project is invalid.",

            "database_id.required" => "Database is required.",
            "database_id.exists"   => "Selected database is invalid.",

            "province_id.required" => "Province is required.",
            "province_id.exists"   => "Selected province is invalid.",

            "manager_id.required"  => "Manager is required.",
            "manager_id.exists"    => "Selected manager is invalid.",

            "fromDate.required"    => "From date is required.",
            "fromDate.date"        => "From date must be a valid date.",

            "toDate.required"      => "To date is required.",
            "toDate.date"          => "To date must be a valid date.",
            "toDate.after_or_equal"=> "To date must be after or equal to from date.",
        ];
    }
}
