<?php

namespace App\Models;

use App\Models\BaseModel;
use App\Traits\CascadeAllDeletes;
use Illuminate\Database\Eloquent\SoftDeletes;

class Kit extends BaseModel
{    

    use SoftDeletes, CascadeAllDeletes;

    protected $fillable = [

        "name",
        "description",
        "status"

    ];

    protected $cascadeDeletes = [
        'distributions',
    ];

    public function distributions ()
    {
        return $this->hasMany(KitDistribution::class);
    }
}
