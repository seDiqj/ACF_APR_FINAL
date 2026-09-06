<?php

namespace App\Models;

use App\Models\BaseModel;
use App\Traits\CascadeAllDeletes;
use Illuminate\Database\Eloquent\SoftDeletes;

class IndicatorType extends BaseModel
{

    use SoftDeletes, CascadeAllDeletes;

    protected $cascadeDeletes = [
        'indicators',
    ];

    public function indicators()
    {
        return $this->hasMany(Indicator::class, 'type_id');
    }

}
