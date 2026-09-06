<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreKitDistributionRequest extends FormRequest
{
    public function authorize(): bool
    {
        // اگر نیاز داری اینجا شرط بگذار
        return true;
    }

    public function rules(): array
    {
        return [
            'beneficiary_id'    => 'required|exists:beneficiaries,id',
            'kit_id'            => 'required|exists:kits,id',
            'destribution_date' => 'required|date',
            'remark'            => 'nullable|string|max:255',
            'is_received'       => 'required|boolean',
        ];
    }
}