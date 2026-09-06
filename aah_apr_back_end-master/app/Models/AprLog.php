<?php

namespace App\Models;
use App\Models\User;
use App\Models\BaseModel;
use App\Models\Apr;


class AprLog extends BaseModel
{
    protected $fillable = [
        'apr_id',
        'user_id',
        'action',
        'comment'
    ];

    public function apr ()
    {
        return $this->belongsTo(Apr::class);
    }

    public function user () 
    {
        return $this->belongsTo(User::class);
    }
}
