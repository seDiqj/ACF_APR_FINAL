<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\BaseModel;
use App\Traits\CascadeAllDeletes;
use Illuminate\Database\Eloquent\SoftDeletes;

class Enact extends BaseModel
{
    use HasFactory, SoftDeletes, CascadeAllDeletes;

    protected $fillable = [
        'project_id',
        'province_id',
        'indicator_id',
        'councilorName',
        'raterName',
        'type',
        'date',
        'aprIncluded',
    ];

    protected $cascadeDeletes = [
        'assessments',
    ];

    protected $hidden = [
        "created_at",
        "updated_at"
    ];

    protected $casts = [
        "aprIncluded" => "boolean"
    ];

    public function assessments()
    {
        return $this->hasMany(Assessment::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function province()
    {
        return $this->belongsTo(Province::class);
    }

    public function indicator()
    {
        return $this->belongsTo(Indicator::class);
    }
}