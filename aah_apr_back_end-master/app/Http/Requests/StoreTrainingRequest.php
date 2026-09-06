<?php

namespace App\Http\Requests;

use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Validator;

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

    public function after(): array
    {
        return [
            function (Validator $validator) {

                $project = Project::find ($this->input('project_id'));

                $trainingStartDate = Carbon::parse($this->input('startDate'));
                $trainingEndDate = Carbon::parse($this->input('endDate'));

                $projectStartDate = Carbon::parse($project->startDate);
                $projectEndDate = Carbon::parse($project->endDate);

                if ($trainingStartDate->lt($projectStartDate)) {

                    $validator->errors()->add(
                        'startDate',
                        'Training start date should be not before selected project start date !'
                    );

                    return;
                }

                if ($trainingEndDate->gt($projectEndDate)) {

                    $validator->errors()->add(
                        'endDate',
                        'Training end date should be not after selected project end date'
                    );

                }
            }
        ];
    }
}
