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
            'output' => 'required|string|min:1',
            'outputRef' => 'required|string|min:1|max:255',
        ];
    }

}
