<?php


namespace App\DTOs;

use Illuminate\Support\Collection;

class UserDTO {

    public Collection $users;

    public function __construct(Collection $users)
    {
        $this->users = $users;
    }

}