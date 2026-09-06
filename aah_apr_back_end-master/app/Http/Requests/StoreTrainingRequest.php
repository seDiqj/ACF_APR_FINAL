<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTrainingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id'    => 'required|exists:projects,id',
            'province_id'   => 'required|exists:provinces,id',
            'district_id'   => 'required|exists:districts,id',
            'indicator_id'  => 'required|exists:indicators,id',

            'trainingLocation'   => 'required|string|max:255',
            'name'               => 'required|string|max:255',
            'participantCatagory'=> 'required|in:acf-staff,stakeholder',
            'aprIncluded'        => 'required|boolean',
            'trainingModality'   => 'required|in:face-to-face,online',
            'startDate'          => 'required|date',
            'endDate'            => 'required|date|after_or_equal:startDate',

            'chapters'           => 'nullable|array',
            'chapters.*.topic'               => 'required_with:chapters|string|max:255',
            'chapters.*.facilitatorName'     => 'required_with:chapters|string|max:255',
            'chapters.*.facilitatorJobTitle' => 'required_with:chapters|string|max:255',
            'chapters.*.startDate'           => 'required_with:chapters|date',
            'chapters.*.endDate'             => 'required_with:chapters|date|after_or_equal:chapters.*.startDate',
        ];
    }
}
