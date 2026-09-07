<?php

namespace App\Http\Requests;

use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Validator;

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
            "councilorName" => "required|string|min:3|max:255",
            "raterName" => "required|string|min:3|max:255",
            "type" => "required|in:enact",
            "date" => "required|date",
            "aprIncluded" => "required|boolean"
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {

                $date = Carbon::parse($this->input('date'));

                $project = Project::find($this->input('project_id'));

                $projectStartDate = Carbon::parse($project->startDate);
                $projectEndDate = Carbon::parse($project->endDate);

                if ($date->lt($projectStartDate) || $date->gt($projectEndDate)) 
                {
                    $validator->errors()->add('date', 'The date must be between the selected project start and end dates.');
                }

            }
        ];
    }
}
