<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\BaseModel;
use App\Traits\CascadeAllDeletes;
use Illuminate\Database\Eloquent\SoftDeletes;

class Question extends BaseModel
{
    use HasFactory, CascadeAllDeletes, SoftDeletes;

    protected $fillable = [
        'group',
        'description',
    ];

    protected $cascadeRelations = [
        'assessments',
    ];

    public function assessments()
    {
        return $this->belongsToMany(Assessment::class, 'assessment_question')
            ->withPivot('score')
            ->withTimestamps();
    }
}