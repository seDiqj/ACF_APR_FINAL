<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Indicator;
use App\Models\Province;

class IndicatorProvince extends Model
{

    protected $table = "indicator_province";
    

    protected $fillable = [
        "indicator_id",
        "province_id",
        "target",
        "achived_target",
        "councilorCount"
    ];

    protected $hidden = [
        "created_at",
        "updated_at"
    ];

    public function indicator () {
        return $this->belongsTo(Indicator::class);
    }

    public function province () {
        return $this->belongsTo(Province::class);
    }

}
