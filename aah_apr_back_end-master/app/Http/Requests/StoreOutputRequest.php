<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOutputRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'outcomeId' => 'required|exists:outcomes,id',
            'output' => 'required|string',
            'outputRef' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'outcomeId.required' => 'Outcome selection is required.',
            'outcomeId.exists' => 'The selected outcome is invalid.',
            'output.required' => 'The output field is required.',
            'outputRef.required' => 'The output reference field is required.',
        ];
    }

}
