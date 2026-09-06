<?php

namespace App\Models;

use App\Models\BaseModel;
use App\Traits\CascadeAllDeletes;
use Illuminate\Database\Eloquent\SoftDeletes;

class Isp3 extends BaseModel
{

    use SoftDeletes, CascadeAllDeletes;

    protected $hidden = [
        "created_at",
        "updated_at"
    ];

    protected $cascadeRelations = [
        'indicators',
    ];

    public function indicators ()
    {
        return $this->belongsToMany(Indicator::class);
    }
}
