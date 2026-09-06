<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BeneficiaryCommunityDialogueSession extends Model
{

    protected $table = "beneficiary_community_dialogue_session";

    protected $fillable = [
        "community_dialogue_session_id",
        "beneficiary_id",
        "isPresent"
    ];

    protected $casts = [
        "isPresent" => "boolean"
    ];
}
