<?php

namespace App\Models;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Referral extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'beneficiary_id',
        'indicator_id',

        /*
        |--------------------------------------------------------------------------
        | Referral Questions
        |--------------------------------------------------------------------------
        */

        'referralConcern',
        'referralConcernNote',

        'concentGiven',
        'consentProvided',
        'consentReason',

        'needReferral',

        /*
        |--------------------------------------------------------------------------
        | General Information
        |--------------------------------------------------------------------------
        */

        'problemReportedBy',
        'caseNumber',
        'type',

        /*
        |--------------------------------------------------------------------------
        | Referred By
        |--------------------------------------------------------------------------
        */

        'referrerName',
        'referrerAgency',
        'referrerPosition',
        'referrerPhone',
        'referrerEmail',
        'referrerAddress',

        /*
        |--------------------------------------------------------------------------
        | Referred To
        |--------------------------------------------------------------------------
        */

        'referredToName',
        'referredToAgency',
        'referredToPosition',
        'referredToPhone',
        'referredToEmail',
        'referredToAddress',

        /*
        |--------------------------------------------------------------------------
        | Referral Details
        |--------------------------------------------------------------------------
        */

        'dateOfReferral',

        /*
        |--------------------------------------------------------------------------
        | Personal Information
        |--------------------------------------------------------------------------
        */

        'nationalId',
        'currentAddress',
        'spokenLanguage',

        /*
        |--------------------------------------------------------------------------
        | Referral Reasons
        |--------------------------------------------------------------------------
        */

        'referralReason',
        'mentalHealthAlert',
        'mentalHealthDesk',

        /*
        |--------------------------------------------------------------------------
        | Services
        |--------------------------------------------------------------------------
        */

        'serviceRequested',
        'otherServiceText',
        'expectedOutcome',

        /*
        |--------------------------------------------------------------------------
        | Provider Decision
        |--------------------------------------------------------------------------
        */

        'referralAccepted',
        'referralRejectedReasone',
    ];

    protected $casts = [

        /*
        |--------------------------------------------------------------------------
        | Boolean Fields
        |--------------------------------------------------------------------------
        */

        'referralConcern' => 'boolean',
        'concentGiven' => 'boolean',
        'consentProvided' => 'boolean',
        'needReferral' => 'boolean',
        'referralAccepted' => 'boolean',

        /*
        |--------------------------------------------------------------------------
        | Date Fields
        |--------------------------------------------------------------------------
        */

        'dateOfReferral' => 'date',

        /*
        |--------------------------------------------------------------------------
        | JSON Fields
        |--------------------------------------------------------------------------
        */

        'spokenLanguage' => 'array',
        'mentalHealthAlert' => 'array',
        'serviceRequested' => 'array',
    ];

    public function beneficiary()
    {
        return $this->belongsTo(Beneficiary::class);
    }

    public function indicator()
    {
        return $this->belongsTo(Indicator::class);
    }
}