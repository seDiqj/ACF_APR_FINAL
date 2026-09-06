<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreIndicatorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'output_id' => ['required', 'exists:outputs,id'],
            'parent_indicator' => ['nullable'],
            'database_id' => ['required', 'exists:databases,id'],
            'indicator' => ['required', 'string', 'max:255'],
            'indicatorRef' => ['required', 'string', 'max:255', 'unique:indicators,indicatorRef'],
            'target' => ['required', 'integer', 'min:0'],
            'status' => ['required', 'in:notStarted,inProgress,achived,notAchived,partiallyAchived'],
            'dessaggregationType' => ['required', 'in:session,indevidual,enact'],
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'output_id.required' => 'Output ID is required.',
            'output_id.exists' => 'The selected output does not exist.',
                    
            'database_id.required' => 'Database ID is required.',
            'database_id.exists' => 'The selected database does not exist.',
            
            'indicator.required' => 'Indicator name is required.',
            'indicator.string' => 'Indicator must be a string.',
            'indicator.max' => 'Indicator must not exceed 255 characters.',
            
            'indicatorRef.required' => 'Indicator reference is required.',
            'indicatorRef.string' => 'Indicator reference must be a string.',
            'indicatorRef.max' => 'Indicator reference must not exceed 255 characters.',
            'indicatorRef.unique' => 'Indicator reference must be unique.',
            
            'target.required' => 'Target value is required.',
            'target.integer' => 'Target must be an integer.',
            'target.min' => 'Target must be at least 0.',
            
            'achived_target.integer' => 'Achived target must be an integer.',
            'achived_target.min' => 'Achived target must be at least 0.',
            
            'status.required' => 'Status is required.',
            'status.in' => 'Status must be one of: notStarted, inProgress, achived, notAchived, partiallyAchived.',
            
            'dessaggregationType.required' => 'Dessaggregation type is required.',
            'dessaggregationType.in' => 'Dessaggregation type must be one of: session, indevidual, enact.',
            
            'description.string' => 'Description must be a string.',
        ];
    }
}
