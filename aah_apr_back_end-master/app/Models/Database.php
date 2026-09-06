<?php

namespace App\Models;

use App\Models\BaseModel;
use App\Traits\CascadeAllDeletes;
use Illuminate\Database\Eloquent\SoftDeletes;

class Database extends BaseModel
{

    use SoftDeletes, CascadeAllDeletes;

    protected $fillable = [
        "name"
    ];

    protected $cascadeDeletes = [
        'indicators',
        'programs',
        'aprs'
    ];

    protected $cascadeRelations = [
        'beneficiaries',
    ];

    protected $hidden = [
        "created_at",
        "updated_at"
    ];

    public function beneficiaries ()
    {
        return $this->belongsToMany(Beneficiary::class, "database_program_beneficiary")
                        ->withPivot("program_id");
    }

    public function indicators ()
    {
        return $this->hasMany(Indicator::class);
    }

    public function programs ()
    {
        return $this->hasMany(Program::class);
    }

    public function aprs () 
    {
        return $this->hasMany(Apr::class);
    }
}
