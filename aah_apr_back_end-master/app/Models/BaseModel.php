<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BaseModel extends Model
{
    use SoftDeletes;

    protected $hidden = ["deleted_at"];

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        if (isset($this->hidden)) {
            $this->hidden = array_merge(['deleted_at'], $this->hidden);
        }else {
            $this->hidden = ['deleted_at'];
        }
    }
}
