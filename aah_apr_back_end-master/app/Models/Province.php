<?php

namespace App\Models;

use App\Models\BaseModel;
use App\Traits\CascadeAllDeletes;
use Dyrynda\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\SoftDeletes;

class Province extends BaseModel
{    

    use SoftDeletes, CascadeAllDeletes;

    protected $fillable = [
        "name"
    ];

    protected $cascadeDeletes = [
        'aprs',
        'enacts',
        'trainings',
        'programs',
        'dessaggregations',
    ];

    protected $cascadeRelations = [
        'indicators',
    ];

    protected $hidden = [
        "created_at",
        "updated_at",
    ];

    public function project ()
    {
        return $this->belongsTo(Project::class);
    }

    public function indicators()
    {
        return $this->belongsToMany(Indicator::class)
                        ->withPivot(["target", "councilorCount"])
                        ->withTimestamps();
    }

    public function aprs ()
    {
        return $this->hasMany(Apr::class);
    }

    public function enacts () 
    {
        return $this->hasMany(Enact::class);
    }

    public function trainings ()
    {
        return $this->hasMany(Training::class);
    }

    public function programs () 
    {
        return $this->hasMany(Program::class);
    }

    public function dessaggregations()
    {
        return $this->hasMany(Dessaggregation::class);
    }
}
