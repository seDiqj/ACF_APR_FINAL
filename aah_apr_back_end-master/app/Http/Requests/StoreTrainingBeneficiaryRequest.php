<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTrainingBeneficiaryRequest extends FormRequest
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
            'dateOfRegistration' => 'nullable|date',
            "name" => "required|string|min:3",
            "fatherHusbandName" => "required|string|min:3",
            "gender" => "required|in:male,female,other",
            "age" => "required|integer",
            "phone" => "required|digits:10",
            "email" => "required|email",
            "code" => "required|string",
            "participantOrganization" => "required|string",
            "jobTitle" => "required|string"
        ];
    }
}
