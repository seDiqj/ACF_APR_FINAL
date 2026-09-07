<?php

namespace App\Http\Requests;

use App\Models\Program;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateMainDatabaseBeneficiaryRequest extends FormRequest
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
            'program' => 'required|exists:programs,id',
            'phone' => 'required|min:5|max:20',
            'name' => 'required|string|min:3|max:255',
            'maritalStatus' => 'required|in:single,married,divorced,widowed,widower,separated',
            'literacyLevel' => 'required|max:255',
            'householdStatus' => 'required|in:idp_drought,idp_conflict,returnee,host_community,refugee',
            'gender' => 'required|in:male,female,other',
            'fatherHusbandName' => 'required|string|min:3|max:255',
            'disabilityType' => 'required|in:person_with_disability,person_without_disability',
            'dateOfRegistration' => 'required|date',
            'code' => ['required','max:255', Rule::unique('beneficiaries', 'code')->ignore($this->route('id'))],
            'childCode' => 'nullable|string|max:255',
            'childAge' => 'nullable|string|min:1|max:255',
            'age' => 'required|integer|min:1|max:150',
        ];
    }

    public function after(): array
    {
        return [

            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) return;

                $program = Program::with('project')->find($this->input('program'));
                
                if (!$program) {
                    $validator->errors()->add(
                        'program',
                        "The selected program does not belong to any project."
                    );

                    return;
                }

                $bnfDateOfRegistration = Carbon::parse($this->input('dateOfRegistration'));
                $projectStartDate = Carbon::parse($program->project->startDate);
                $projectEndDate = Carbon::parse($program->project->endDate);

                if ($bnfDateOfRegistration->lt($projectStartDate) || $bnfDateOfRegistration->gt($projectEndDate)) {
                    $validator->errors()->add(
                        'dateOfRegistration',
                        'Beneficiary date of registration must be within the selected program corosponding project date range !'
                    );
                }


            }

        ];
    }
}
