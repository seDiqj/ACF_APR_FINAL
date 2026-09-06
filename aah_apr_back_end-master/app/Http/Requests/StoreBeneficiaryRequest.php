<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBeneficiaryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'program'             => 'required|exists:programs,id',
            'dateOfRegistration' => 'nullable|date',
            'code'                 => 'nullable|string|max:255',
            'name'                 => 'required|string|max:255',
            'fatherHusbandName'  => 'required|string|max:255',
            'age'                  => 'required|integer|min:0',
            'gender'               => 'required|in:male,female,other',
            'maritalStatus'       => 'nullable|in:single,married,divorced,widowed,widower,sperated',
            'childCode'           => 'nullable|string|max:255',
            'childAge'            => 'nullable|integer|min:0',
            'phone'                => 'required|string|max:255',
            'nationalId'          => 'nullable|string|max:20',
            'householdStatus'      => 'nullable|string|max:255',
            'literacyLevel'       => 'nullable|string|max:100',
            'jobTitle'            => 'nullable|string|max:255',
            'disabilityType'      => 'nullable|string|max:255',
            'protectionServices'  => 'nullable|boolean',
            'incentiveReceived'   => 'nullable|boolean',
            'incentiveAmount'     => 'nullable|string|max:255',
            'participantOrgnization' => 'nullable|string|max:255',
            'email'                => 'nullable|email|max:255',
            'indicators'          => 'nullable|array',
            'indicators.*'        => 'exists:indicators,id',
        ];
    }
}