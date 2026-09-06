<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreNewAprRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            "project_id" => "required|integer|exists:projects,id",
            "database_id" => "required|integer|exists:databases,id",
            "province_id" => "required|integer|exists:provinces,id",
            "manager_id" => "required|integer|exists:users,id",
            "fromDate" => "required",
            "toDate" => "required",
            "comment" => "nullable|string",
        ];
    }
}
