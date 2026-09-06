<?php

namespace App\Models;

use App\Models\BaseModel;
use App\Traits\CascadeAllDeletes;
use Illuminate\Database\Eloquent\SoftDeletes;

class CommunityDialogueSession extends BaseModel
{

    use SoftDeletes, CascadeAllDeletes;

    protected $fillable = [
        "community_dialogue_id",
        "type",
        "topic",
        "date"
    ];

    protected $cascadeRelations = [
        'beneficiaries'
    ];

    protected $hidden = [
        "created_at",
        "updated_at"
    ];

   public function beneficiaries()
    {
        return $this->belongsToMany(
            Beneficiary::class,
            'beneficiary_community_dialogue_session',
            'community_dialogue_session_id',
            'beneficiary_id'
        )
        ->withPivot('isPresent')
        ->withTimestamps();
    }

}
