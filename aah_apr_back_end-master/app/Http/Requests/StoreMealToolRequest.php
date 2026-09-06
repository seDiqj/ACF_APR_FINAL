<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreMealToolRequest extends FormRequest
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
            'baseline' => 'required|in:low,moderate,high,evaluationNotPossible,n/a',
            'endline' => 'required|in:low,moderate,high,evaluationNotPossible,n/a',
            'baselineDate' => 'required|date',
            'endlineDate' => 'required|date',
            'baselineTotalScore' => 'required|numeric',
            'endlineTotalScore' => 'required|numeric',
            'evaluation' => 'required|numeric',
            'beneficiary_id' => 'required|exists:beneficiaries,id',
            'improvementPercentage' => 'required|numeric',
            'isBaselineActive' => 'required|boolean',
            'isEndlineActive' => 'required|boolean',
            'type' => 'required|string|max:255',
        ];
    }
}
