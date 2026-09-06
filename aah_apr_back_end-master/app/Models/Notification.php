<?php

namespace App\Models;

use App\Models\BaseModel;
use App\Traits\CascadeAllDeletes;
use Illuminate\Database\Eloquent\SoftDeletes;

class Notification extends BaseModel
{    

    use SoftDeletes, CascadeAllDeletes;

    protected $fillable = [
        "title",
        "message",
        "database_id",
        "project_id",
        "apr_id",
        "type",
    ];

    protected $cascadeRelations = [
        'users',
    ];

    public function users ()
    {
        return $this->belongsToMany(User::class);
    }

    public function project ()
    {
        return $this->belongsTo(Project::class);
    }

    public function apr ()
    {
        return $this->belongsTo(Apr::class);
    }
}
