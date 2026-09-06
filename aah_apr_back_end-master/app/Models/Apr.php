<?php

namespace App\Models;
use App\Models\BaseModel;
use Dyrynda\Database\Support\CascadeSoftDeletes;
use Illuminate\Database\Eloquent\SoftDeletes;

class Apr extends BaseModel
{    

    use SoftDeletes, CascadeSoftDeletes;

    protected $fillable = [
        "project_id",
        "database_id",
        "province_id",
        "manager_id",
        "status",
        "fromDate",
        "toDate"
    ];

    protected $cascadeDeletes = [
        'logs',
        "notifications"
    ];


    protected $hidden = [
        "created_at",
        "updated_at"
    ];


    public function project ()
    {
        return $this->belongsTo(Project::class);
    }

    public function database ()
    {
        return $this->belongsTo(Database::class);
    }

    public function province ()
    {
        return $this->belongsTo(Province::class);
    }

    public function logs ()
    {
        return $this->hasMany(AprLog::class);
    }

    public function notifications ()
    {
        return $this->hasMany(Notification::class);
    }

    public function manager ()
    {
        return $this->belongsTo(User::class, "manager_id");
    }
}
