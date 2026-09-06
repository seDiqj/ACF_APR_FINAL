<?php

namespace App\Models;

use App\Models\CommunityDialogueSession;
use App\Models\BaseModel;
use Dyrynda\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\SoftDeletes;

class Beneficiary extends BaseModel
{

    use SoftDeletes, CascadeSoftDeletes;

    protected $fillable = [
        "dateOfRegistration",
        "code",
        "name",
        "fatherHusbandName",
        "age",
        "gender",
        "maritalStatus",
        "childCode",
        "childAge",
        "phone",
        "nationalId",
        "householdStatus",
        "literacyLevel",
        "jobTitle",
        "disabilityType",
        "protectionServices",
        "incentiveReceived",
        "incentiveAmount",
        "participantOrganization",
        "email",
        "aprIncluded"
    ];

    protected $cascadeDeletes = [
        'mealTools',
        'sessions',
    ];

    protected $cascadeHasOne = [
        'evaluation',
        'referral',
    ];

    protected $cascadeRelations = [
        'kits',
        'indicators',
        'programs',
        'databases',
        'trainings',
        'chapters',
        'communityDialogueSessions',
        'groups',
    ];

    protected $casts = [
        "incentiveReceived" => "boolean"
    ];

    public function kits() 
    {
        return $this->belongsToMany(Kit::class, "kit_distributions", "beneficiary_id", "kit_id")
                        ->withPivot("destribution_date", "is_received", "remark");
    }

    public function indicators()
    {
        return $this->belongsToMany(Indicator::class, "beneficiary_indicator")->withTimestamps();
    }

    public function programs ()
    {
        return $this->belongsToMany(Program::class, "database_program_beneficiary", 'beneficiary_id', 'program_id')
                        ->withPivot("database_id");
    }

    public function databases ()
    {
        return $this->belongsToMany(Database::class, "database_program_beneficiary", "beneficiary_id", "database_id");
    }

    public function mealTools ()
    {
        return $this->hasMany(MealTool::class);
    }

    public function evaluation ()
    {
        return $this->hasOne(Evaluation::class);
    }

    public function trainings ()
    {
        return $this->belongsToMany(Training::class);
    }

    public function chapters ()
    {
        return $this->belongsToMany(Chapter::class)
                        ->withPivot("isPresent", "preTestScore", "postTestScore", "remark")
                        ->withTimestamps();
    }

    public function communityDialogueSessions()
    {
        return $this->belongsToMany(
            CommunityDialogueSession::class,
            'beneficiary_community_dialogue_session', 
            'beneficiary_id',                        
            'community_dialogue_session_id'
        )
        ->withPivot("isPresent")
        ->withTimestamps();
    }

    public function referral ()
    {
        return $this->hasOne(Referral::class);
    }

    public function sessions ()
    {
        return $this->hasMany(IndicatorSession::class);
    }

    public function cdSessions()
    {
        return $this->belongsToMany(
            CommunityDialogueSession::class,
            'beneficiary_community_dialogue_session',
            'beneficiary_id',
            'community_dialogue_session_id'
        )->withPivot("isPresent");
    }

    public function groups ()
    {
        return $this->belongsToMany(Group::class)->withTimestamps();
    }
}
