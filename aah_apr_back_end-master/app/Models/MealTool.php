<?php

namespace App\Models;

use App\Models\BaseModel;

class MealTool extends BaseModel
{    
    protected $fillable = [
        "beneficiary_id",
        "type",
        "baselineDate",
        "endlineDate",
        "baselineTotalScore",
        "endlineTotalScore",
        "improvementPercentage",
        "baseline",
        "endline",
        "isBaselineActive",
        "isEndlineActive",
        "evaluation",
    ];

    protected $casts = 
    [
        'isBaselineActive' => 'boolean',
        'isEndlineActive' => 'boolean'
    ];


    public function beneficiary ()
    {
        return $this->belongsTo(Beneficiary::class);
    }
}
