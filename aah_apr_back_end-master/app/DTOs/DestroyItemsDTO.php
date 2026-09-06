<?php

namespace App\DTOs;

class DestroyItemsDTO {

    public array $ids;

    public function __construct(array $data)
    {
        $this->ids = $data;
    }

    public function use () : array {

        return $this->ids;

    }
}