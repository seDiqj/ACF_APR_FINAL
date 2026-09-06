<?php

namespace App\DTOs;

class IndexUserDTO {

    public string | null $name;
    public string | null $email;
    public string | null $title;
    public string | null $status;
    public string | null $created_at;
    public string | null $search;

    public function __construct(string | null $name, string | null $email, string | null $title, string | null $status, string | null $created_at, string | null $search)
    {
        $this->name = $name;
        $this->email = $email;
        $this->title = $title;
        $this->status = $status;
        $this->created_at = $created_at;
        $this->search = $search;
    }

}