<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KitDistribution extends Model
{

    protected $fillable = 
    [
        "beneficiary_id",
        "kit_id",
        "destribution_date",
        "remark",
        "is_received"
    ];

    protected $casts = 
    [
        "is_received" => 'boolean'
    ];

    public function beneficiary ()
    {
        return $this->belongsTo(Beneficiary::class);
    }

    public function kit ()
    {
        return $this->belongsTo(Kit::class);
    }
}
