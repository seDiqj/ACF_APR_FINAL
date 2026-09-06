<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOutcomeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id'         => 'required|exists:projects,id',
            'outcome'            => 'required|string|min:1',
            'outcomeRef'         => 'required|string|min:1'
        ];
    }

    public function messages(): array
    {
        return [
            'project_id' => 'Please create project before adding new outcome !',
            'outcome'    => 'Outcome is required !',
            'outcomeRef' => 'Outcome referance is required !'
        ];
    }
}
