<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\BaseModel;

class Dessaggregation extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'indicator_id',
        'province_id',
        'description',
        'target',
        'achived_target',   
    ];

    protected $casts = [
        'months' => 'array',
    ];


    public function indicator()
    {
        return $this->belongsTo(Indicator::class);
    }

    public function province()
    {
        return $this->belongsTo(Province::class);
    }
}
