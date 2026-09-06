<?php

namespace App\Models;

use App\Models\BaseModel;

class Evaluation extends BaseModel
{
    protected $fillable = [
        "beneficiary_id",
        "date",
        "clientSessionEvaluation",
        "otherClientSessionEvaluation",
        "clientSatisfaction",
        "satisfactionDate",
        "dischargeReason",
        "otherDischargeReasone",
        "dischargeReasonDate"
    ];

    protected $casts = [
        "clientSessionEvaluation" => "array",
        "dischargeReason" => "array"
    ];

    public function beneficiary () 
    {
        return $this->belongsTo(Beneficiary::class);
    }
}
