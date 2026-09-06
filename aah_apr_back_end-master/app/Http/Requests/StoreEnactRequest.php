<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEnactRequest extends FormRequest
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
            "project_id" => "required|exists:projects,id",
            "province_id" => "required|exists:provinces,id",
            "indicator_id" => "required|exists:indicators,id",
            "councilorName" => "required|string|min:3",
            "raterName" => "required|string|min:3",
            "type" => "required|in:enact",
            "date" => "required|date",
            "aprIncluded" => "required|boolean"
        ];
    }
}
