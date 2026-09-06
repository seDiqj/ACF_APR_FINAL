<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;

trait CascadeAllDeletes
{

    /**
     * Boot the trait.
     */
    protected static function bootCascadeAllDeletes()
    {
        static::deleting(function (Model $model) {
            
            // 1️⃣ Handle hasMany relations
            if (!empty($model->cascadeDeletes)) {
                foreach ($model->cascadeDeletes as $relation) {
                    if ($model->$relation()->exists()) {
                        $model->$relation()->each(function ($item) use ($model) {
                            $model->isForceDeleting() 
                                ? $item->forceDelete() 
                                : $item->delete();
                        });
                    }
                }
            }

            // 2️⃣ Handle hasOne relations
            if (!empty($model->cascadeHasOne)) {
                foreach ($model->cascadeHasOne as $relation) {
                    $related = $model->$relation;
                    if ($related) {
                        $model->isForceDeleting() 
                            ? $related->forceDelete() 
                            : $related->delete();
                    }
                }
            }

            // 3️⃣ Handle belongsToMany relations (detach pivot)
            if (!empty($model->detachRelations)) {
                foreach ($model->detachRelations as $relation) {
                    if ($model->$relation()->exists()) {
                        $model->$relation()->detach();
                    }
                }
            }
        });
    }
}
