<?php

namespace App\Models;

use App\Models\BaseModel;
use App\Traits\CascadeAllDeletes;
use Illuminate\Database\Eloquent\SoftDeletes;

class Chapter extends BaseModel
{

    use SoftDeletes, CascadeAllDeletes;

    protected $fillable = [
        "training_id",
        "topic",
        "facilitatorName",
        "facilitatorJobTitle",
        "startDate",
        "endDate",
    ];

    protected $hidden = [
        "created_at",
        "updated_at"
    ];

    protected $cascadeRelations = [
        'beneficiaries',
    ];

    public function training ()
    {
        return $this->belongsTo(Training::class);
    }

    public function beneficiaries ()
    {
        return $this->belongsToMany(Beneficiary::class)
                        ->withPivot("isPresent", "preTestScore", "postTestScore")
                        ->withTimestamps();
    }
}
