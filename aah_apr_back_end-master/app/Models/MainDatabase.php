<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MainDatabase extends Model
{
    protected $fillable = [
        "program_id",
        "beneficiary_id"
    ];
}
