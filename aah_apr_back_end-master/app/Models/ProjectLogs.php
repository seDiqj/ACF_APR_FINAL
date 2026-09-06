<?php

namespace App\Models;

use App\Models\BaseModel;

class ProjectLogs extends BaseModel
{    
    protected $fillable = [
        "project_id",
        "user_id",
        "action",
        "comment",
        "result"
    ];

    protected $hidden = [
        "updated_at",
    ];


    public function project ()
    {
        return $this->belongsTo(Project::class);
    }

    public function user ()
    {
        return $this->belongsTo(User::class);
    }
}
