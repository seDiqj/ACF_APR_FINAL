<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateIndicatorRequest extends FormRequest
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
            'database' => 'required|exists:databases,name',
            'description' => 'nullable|string',
            'dessaggregationType' => 'in:session,indevidual,enact',
            'indicator' => 'required|string|min:3',
            'indicatorRef' => 'required|string|min:1|max:255',
            'outputId' => 'required|exists:outputs,id',
            'parentIndicator' => 'nullable|exists:indicators,id',
            'target' => 'required|integer',
            'type' => 
            'nullable|in:adult_psychosocial_support,child_psychosocial_support,parenting_skills,child_care_practices',
            'provinces' => 'required|array',
            'provinces.*.province' => 'required|exists:provinces,name',
            'provinces.*.target' => 'required|integer',
            'provinces.*.councilorCount' => 'nullable|integer',
            'status' => 'required|in:notStarted,inProgress,achived,notAchived,partiallyAchived',
            'subIndicator' => 'nullable|array|prohibited_unless:database,main_database',
            'subIndicator.name' => 'nullable|string|min:1|max:255',
            'subIndicator.provinces' => 'nullable|array',
            'subIndicator.provinces.*.province' => 'required|exists:provinces,name',
            'subIndicator.provinces.*.target' => 'required|integer',
            'subIndicator.provinces.*.councilorCount' => 'required|integer',
            'subIndicator.target' => 'nullable|integer',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $provinces = $this->input('provinces', []);

                $provincesTotalTarget = collect($provinces)->sum('target');

                $indicatorTarget = $this->input('target');

                if ((float) $provincesTotalTarget !== (float) $indicatorTarget) {
                    $validator->errors()->add(
                        'provinces',
                        "The total target of all provinces ({$provincesTotalTarget}) must be equal to the indicator target ({$indicatorTarget})."
                    );
                }
            }
        ];
    }
}
