<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\BaseModel;
use App\Traits\CascadeAllDeletes;
use Illuminate\Database\Eloquent\SoftDeletes;

class Outcome extends BaseModel
{
    use HasFactory, SoftDeletes, CascadeAllDeletes;

    protected $fillable = [
        'outcome',
        'outcomeRef',
        'project_id',
    ];

    protected $cascadeDeletes = [
        'outputs',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function outputs()
    {
        return $this->hasMany(Output::class);
    }
}
