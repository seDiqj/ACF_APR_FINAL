<?php

namespace App\Models;

use App\Models\BaseModel;


class Psychoeducations extends BaseModel
{    
    protected $fillable = [
        "program_id",
        "indicator_id",
        "awarenessTopic",
        "awarenessDate",
        // men
        "ofMenHostCommunity",
        "ofMenIdp",
        "ofMenRefugee",
        "ofMenReturnee",
        // women
        "ofWomenHostCommunity",
        "ofWomenIdp",
        "ofWomenRefugee",
        "ofWomenReturnee",
        // boy
        "ofBoyHostCommunity",
        "ofBoyIdp",
        "ofBoyRefugee",
        "ofBoyReturnee",
        // girl
        "ofGirlHostCommunity",
        "ofGirlIdp",
        "ofGirlRefugee",
        "ofGirlReturnee",
        "remark",
    ];

    protected $hidden = [
        "created_at",
        "updated_at"
    ];

    public function indicator ()
    {
        return $this->belongsTo(Indicator::class);
    }

    public function program ()
    {
        return $this->belongsTo(Program::class);
    }
}

