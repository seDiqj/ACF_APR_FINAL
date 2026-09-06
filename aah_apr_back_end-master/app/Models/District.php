<?php

namespace App\Models;

use App\Models\BaseModel;
use App\Traits\CascadeAllDeletes;
use Illuminate\Database\Eloquent\SoftDeletes;

class District extends BaseModel
{

    use SoftDeletes, CascadeAllDeletes;

    protected $fillable = [
        "name",
    ];

    protected $cascadeDeletes = [
        'trainings',
        'programs'
    ];

    public function trainings()
    {
        return $this->hasMany(Training::class);
    }

    public function programs () 
    {
        return $this->hasMany(Program::class);
    }
}
