<?php

namespace App\Models;

use App\Traits\CascadeAllDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Output extends BaseModel
{
    use HasFactory, SoftDeletes, CascadeAllDeletes;

    protected $fillable = 
    [
        'output',
        'outputRef',
        'outcome_id',
    ];

    protected $cascadeDeletes = [
        'indicators',
    ];

    public function outcome()
    {
        return $this->belongsTo(Outcome::class);
    }

    public function project()
    {
        return $this->outcome ? $this->outcome->project() : null;
    }

    public function indicators() 
    {
        return $this->hasMany(Indicator::class);
    }
}
