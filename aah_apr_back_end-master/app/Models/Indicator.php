<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\BaseModel;
use Dyrynda\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\SoftDeletes;


class Indicator extends BaseModel
{
    use HasFactory, SoftDeletes, CascadeSoftDeletes;

    protected $table = "indicators";

    protected $fillable = [
        'output_id',
        'parent_indicator',
        'database_id',
        'type_id',
        'indicator',
        'indicatorRef',
        'target',
        'achived_target',
        'status',
        'dessaggregationType',
        'description',
    ];

    protected $hidden = [
        "created_at",
        "updated_at",
        "deleted_at"
    ];

    protected $cascadeDeletes = [
        'dessaggregations',
        'sessions',
        'enacts',
        'trainings',
        'CommunityDialogues',
    ];

    protected $cascadeRelations = [
        'beneficiaries',
        'provinces',
        'isp3',
    ];

    protected $cascadeHasOne = [
        'psychoeducations',
        'refferals'
    ];

    protected $casts = [

        'monthly_counts' => 'array',

    ];

    public function beneficiaries()
    {
        return $this->belongsToMany(Beneficiary::class, "beneficiary_indicator");
    }
    
    public function output()
    {
        return $this->belongsTo(Output::class);
    }

    public function subIndicator()
    {
        return $this->hasMany(Indicator::class, 'parent_indicator');
    }

    public function parent()
    {
        return $this->belongsTo(Indicator::class, 'parent_indicator');
    }

    public function dessaggregations()
    {
        return $this->hasMany(Dessaggregation::class);
    }

    public function provinces() 
    {
        return $this->belongsToMany(Province::class)
                        ->withPivot(["target", "councilorCount"])
                        ->withTimestamps();
    }

    public function database()
    {
        return $this->belongsTo(Database::class);
    }

    public function sessions ()
    {
        return $this->hasMany(IndicatorSession::class);
    }

    public function isp3 ()
    {
        return $this->belongsToMany(Isp3::class);
    }

    public function type ()
    {
        return $this->belongsTo(IndicatorType::class);
    }

    public function enacts()
    {
        return $this->hasMany(Enact::class);
    }

    public function trainings()
    {
        return $this->hasMany(Training::class);
    }

    public function CommunityDialogues ()
    {
        return $this->hasMany(CommunityDialogue::class);
    }

    public function psychoeducations ()
    {
        return $this->hasMany(Psychoeducations::class);
    }

    public function refferals ()
    {
        return $this->hasMany(Referral::class);
    }
}

