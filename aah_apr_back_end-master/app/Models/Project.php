<?php

namespace App\Models;

use App\Models\Outcome;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\BaseModel;
use App\Traits\CascadeAllDeletes;
use Illuminate\Database\Eloquent\SoftDeletes;


class Project extends BaseModel
{
    use HasFactory, SoftDeletes, CascadeAllDeletes;

    protected $fillable = [
        'projectCode',
        'projectTitle',
        'projectGoal',
        'projectDonor',
        'startDate',
        'endDate',
        'status',
        'aprStatus',
        'projectManager',
        'reportingDate',
        'reportingPeriod',
        'description',
    ];

   protected $casts = [
        'startDate' => 'datetime:F d, Y',
        'endDate' => 'datetime:F d, Y',
    ];


    protected $cascadeDeletes = [
        'programs',
        'outcomes',
        'aprs',
        'trainings',
        'enacts',
        'notifications',
        'logs'
    ];

    protected $cascadeRelations = [
        'provinces',
        'sectors',
    ];

    public function outcomes()
    {
        return $this->hasMany(Outcome::class);
    }

    public function outputs() 
    {
        return $this->hasManyThrough(Output::class, Outcome::class);
    }

    public function indicators()
    {
        return $this->hasManyThrough(
            Indicator::class,
            Output::class,
            'outcome_id',
            'output_id',
            'id',
            'id'
        );
    }

    public function programs () 
    {
        return $this->hasMany(Program::class);
    }

    public function provinces()
    {
        return $this->belongsToMany(Province::class);
    }

    public function databases () 
    {
        return $this->hasManyThrough(Database::class, Program::class);
    }

    public function sectors()
    {
        return $this->belongsToMany(Sector::class);
    }

    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function logs ()
    {
        return $this->hasMany(ProjectLogs::class);
    }

    public function psychoeducations ()
    {
        return $this->hasManyThrough(Psychoeducations::class, Program::class);
    }

    public function aprs()
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

    public function notifications ()
    {
        return $this->hasMany(Notification::class);
    }

}
