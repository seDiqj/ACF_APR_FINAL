<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\BaseModel;

class Assessment extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'enact_id',
        'totalScore',
        'date'
    ];

    protected $hidden = [
        "created_at",
        "updated_at"
    ];

    public function enact()
    {
        return $this->belongsTo(Enact::class);
    }

    public function questions()
    {
        return $this->belongsToMany(Question::class, 'assessment_question')
                    ->withPivot('score')
                    ->withTimestamps();
    }
}
