<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCommunityDialogueRequest extends FormRequest
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

            // PROGRAM INFORMATION VALIDATION

            'programInformation.cdName' => 'required|string|min:1|max:255|unique:community_dialogues,name',
            'programInformation.district_id' => 'required|exists:districts,id',
            'programInformation.focalPoint' =>  'required|string|max:255',
            'programInformation.indicator_id' =>  'required|exists:indicators,id',
            'programInformation.name' =>  'required|string|max:255',
            'programInformation.project_id' =>  'required|exists:projects,id',
            'programInformation.province_id' =>  'required|exists:provinces,id',
            'programInformation.village' =>  'required|string|max:255',

            // GROUP VALIDATION

            'groups' => 'nullable|array',
            'groups.*.name' => 'required|string|max:255',

            // SESSIONS VALIDATION

            'sessions' => 'required|array',
            'sessions.*.type' => 'required|in:initial,followUp',
            'sessions.*.topic' => 'required|string|max:255',
            'sessions.*.date' => 'required|date',

            // REMARK VALIDATION

            'remark' => 'nullable|string|max:1000'

        ];
    }
}
