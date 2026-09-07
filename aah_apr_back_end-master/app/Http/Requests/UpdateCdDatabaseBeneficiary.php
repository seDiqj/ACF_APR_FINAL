<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCdDatabaseBeneficiary extends FormRequest
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
            'age' => 'required|integer|min:1|max:150',
            'code' => ['required','max:255', Rule::unique('beneficiaries', 'code')->ignore($this->route('id'))],
            'currancy' => 'nullable|string|max:255',
            'fatherHusbandName' => 'required|string|min:3|max:255',
            'dateOfRegistration' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'incentiveAmount' => 'required|string|max:255',
            'incentiveReceived' => 'required|boolean',
            'jobTitle' => 'required|string|max:255',
            'maritalStatus' => 'required|in:single,married,divorced,widowed,widower,separated',
            'name' => 'required|string|min:3|max:255',
            'nationalId' => 'required|string|min:5|max:255',
            'phone' => 'required|min:5|max:20',
        ];
    }
}
