<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTrainingBeneficiaryRequest extends FormRequest
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'dateOfRegistration' => 'required|date',
            'name' => 'required|string|min:3|max:255',
            'fatherHusbandName' => 'required|string|min:3|max:255',
            "gender" => "required|in:male,female,other",
            'age' => 'required|integer|min:1|max:150',
            'phone' => 'required|min:10|max:20',
            "email" => "required|email",
            'code' => ['required','max:255', Rule::unique('beneficiaries', 'code')->ignore($this->route('id'))],
            "participantOrganization" => "required|string|min:2|max:255",
            "jobTitle" => "required|string|max:255"
        ];
    }
}
