<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DatabaseProgramBeneficiary extends Model
{

    protected $table = "database_program_beneficiary";
    
    protected $fillable = [
        "database_id",
        "program_id",
        "beneficiary_id"
    ];

}
