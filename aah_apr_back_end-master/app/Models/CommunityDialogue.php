<?php

namespace App\Models;

use App\Models\BaseModel;
use App\Traits\CascadeAllDeletes;
use Illuminate\Database\Eloquent\SoftDeletes;

class CommunityDialogue extends BaseModel
{

    use SoftDeletes, CascadeAllDeletes;

    protected $fillable = [
        "program_id",
        "indicator_id",
        "name",
        "remark",
    ];

    protected $cascadeDeletes = [
        'groups',
        'sessions',
    ];

    protected $cascadeRelations = [
        'beneficiaries',
    ];

    protected $hidden = [
        "created_at",
        "updated_at"
    ];

    public function groups ()
    {
        return $this->hasMany(Group::class);
    }

    public function sessions ()
    {
        return $this->hasMany(CommunityDialogueSession::class);
    }

    public function beneficiaries()
    {
        return Beneficiary::query()
            ->whereHas('communityDialogueSessions', function ($q) {
                $q->whereIn(
                    'community_dialogue_session_id',
                    $this->sessions()->pluck('id')
                );
            });
    }


    public function program ()
    {
        return $this->belongsTo(Program::class);
    }

    public function indicator ()
    {
        return $this->belongsTo(Indicator::class);
    }
}
