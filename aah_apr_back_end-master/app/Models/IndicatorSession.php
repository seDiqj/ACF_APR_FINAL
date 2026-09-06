<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IndicatorSession extends Model
{
    protected $fillable = [
        'indicator_id',
        'beneficiary_id',
        'group',
        'topic',
        'session',
        'date',
        'is_group',
    ];

    protected $casts = [
        'is_group' => 'boolean',
        'date' => 'date:Y-m-d',
    ];

    protected $hidden = [
        'beneficiary_id',
        'indicator_id',
        'created_at',
        'updated_at',
    ];

    public function indicator(): BelongsTo
    {
        return $this->belongsTo(
            Indicator::class
        );
    }

    public function beneficiary(): BelongsTo
    {
        return $this->belongsTo(
            Beneficiary::class
        );
    }
}