<?php

namespace App\Models;

use App\Models\BaseModel;
use App\Traits\CascadeAllDeletes;
use Illuminate\Database\Eloquent\SoftDeletes;

class Program extends BaseModel
{

    use SoftDeletes, CascadeAllDeletes;
    
    protected $fillable = [
        'database_id',
        'name',
        'project_id',
        'focalPoint',
        'province_id',
        'district_id',
        'village',
        'siteCode',
        'healthFacilityName',
        'interventionModality',
    ];

    protected $cascadeDeletes = [
        'communityDialogues',
    ];

    protected $cascadeRelations = [
        'beneficiaries',
    ];

    protected $cascadeHasOne = [
        'psychoeducation',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function province()
    {
        return $this->belongsTo(Province::class);
    }

    public function database()
    {
        return $this->belongsTo(Database::class);
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function beneficiaries ()
    {
        return $this->belongsToMany(Beneficiary::class, "database_program_beneficiary", 'program_id', 'beneficiary_id')
                        ->withPivot("database_id");
    }

    public function psychoeducation ()
    {
        return $this->hasOne(Psychoeducations::class);
    }

    public function communityDialogues ()
    {
        return $this->hasMany(CommunityDialogue::class);
    }
}
