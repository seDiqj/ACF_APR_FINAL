<?php

namespace App\Models;

use App\Models\BaseModel;
use App\Traits\CascadeAllDeletes;
use Illuminate\Database\Eloquent\SoftDeletes;

class Group extends BaseModel
{

    use SoftDeletes, CascadeAllDeletes;

    protected $fillable = [
        "community_dialogue_id",
        "name"
    ];

    protected $cascadeRelations = [
        'beneficiaries',
    ];

    protected $hidden = [
        "created_at",
        "updated_at"
    ];


    public function communityDialogue ()
    {
        return $this->belongsTo(CommunityDialogue::class);
    }

    public function beneficiaries ()
    {
        return $this->belongsToMany(Beneficiary::class);
    }
}
