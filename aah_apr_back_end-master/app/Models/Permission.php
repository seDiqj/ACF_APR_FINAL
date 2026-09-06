<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Permission\Models\Permission as ModelsPermission;

class Permission extends ModelsPermission
{
    use SoftDeletes;

    public $timestamps = true;

    protected $appends = ["created_date", "updated_date"];


    public function getCreatedDateAttribute() {

        return $this->created_at ? $this->created_at->format("Y-m-d") : null;

    }

    public function getUpdatedDateAttribute() {

        return $this->updated_at ?  $this->updated_at->format("Y-m-d") : null;
        
    }
    
}
