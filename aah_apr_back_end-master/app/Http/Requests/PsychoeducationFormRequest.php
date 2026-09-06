<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PsychoeducationFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'programInformation.indicator_id' => 'required|exists:indicators,id',
            'programInformation.project_id' => 'required|exists:projects,id',
            'programInformation.focalPoint' => 'required|string|max:255',
            'programInformation.province_id' => 'required|exists:provinces,id',
            'programInformation.district_id' => 'required|exists:districts,id',
            'programInformation.village' => 'required|string|max:255',
            'programInformation.siteCode' => 'nullable|string|max:255',
            'programInformation.healthFacilityName' => 'nullable|string|max:255',
            'programInformation.interventionModality' => 'nullable|string|max:255',

            'psychoeducationInformation.awarenessTopic' => 'required|string|max:255',
            'psychoeducationInformation.awarenessDate' => 'required|date',

            'psychoeducationInformation.ofMenHostCommunity' => 'nullable|integer|min:0',
            'psychoeducationInformation.ofMenIdp' => 'nullable|integer|min:0',
            'psychoeducationInformation.ofMenRefugee' => 'nullable|integer|min:0',
            'psychoeducationInformation.ofMenReturnee' => 'nullable|integer|min:0',
            'psychoeducationInformation.ofMenDisabilityType' => 'nullable|string|max:255',

            'psychoeducationInformation.ofWomenHostCommunity' => 'nullable|integer|min:0',
            'psychoeducationInformation.ofWomenIdp' => 'nullable|integer|min:0',
            'psychoeducationInformation.ofWomenRefugee' => 'nullable|integer|min:0',
            'psychoeducationInformation.ofWomenReturnee' => 'nullable|integer|min:0',
            'psychoeducationInformation.ofWomenDisabilityType' => 'nullable|string|max:255',

            'psychoeducationInformation.ofBoyHostCommunity' => 'nullable|integer|min:0',
            'psychoeducationInformation.ofBoyIdp' => 'nullable|integer|min:0',
            'psychoeducationInformation.ofBoyRefugee' => 'nullable|integer|min:0',
            'psychoeducationInformation.ofBoyReturnee' => 'nullable|integer|min:0',
            'psychoeducationInformation.ofBoyDisabilityType' => 'nullable|string|max:255',

            'psychoeducationInformation.ofGirlHostCommunity' => 'nullable|integer|min:0',
            'psychoeducationInformation.ofGirlIdp' => 'nullable|integer|min:0',
            'psychoeducationInformation.ofGirlRefugee' => 'nullable|integer|min:0',
            'psychoeducationInformation.ofGirlReturnee' => 'nullable|integer|min:0',
            'psychoeducationInformation.ofGirlDisabilityType' => 'nullable|string|max:255',

            'psychoeducationInformation.remark' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'programInformation.indicator_id.required' => 'Indicator is required.',
            'programInformation.project_id.required' => 'Project is required.',
            'programInformation.province_id.required' => 'Province is required.',
            'programInformation.district_id.required' => 'District is required.',
            'psychoeducationInformation.awarenessTopic.required' => 'Awareness topic is required.',
            'psychoeducationInformation.awarenessDate.required' => 'Awareness date is required.',
            'psychoeducationInformation.awarenessDate.date' => 'Awareness date must be a valid date.',
        ];
    }
}
