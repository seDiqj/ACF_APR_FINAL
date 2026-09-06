<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainingEvaluation extends BaseModel
{
    protected $fillable = [
        'training_id',
        'evaluations',
        'remark',
    ];

    protected $casts = [
        'evaluations' => 'array',
    ];

    protected $hidden = [
        'id',
        'created_at',
        'updated_at',
    ];

    public function training()
    {
        return $this->belongsTo(Training::class);
    }
}