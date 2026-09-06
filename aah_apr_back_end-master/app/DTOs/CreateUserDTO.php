<?php

namespace App\DTOs;


class CreateUserDTO {

    public string $name;
    public string $email;
    public string $title;
    public string $password;
    public string | null $email_verified_at;
    public string | null $photo_path;
    public string $status;
    public string $role;
    public int $created_by;


    public function __construct(array $data)
    {
        $this->name = $data["name"];
        $this->email = $data["email"];
        $this->title = $data["title"];
        $this->password = $data["password"];
        $this->email_verified_at = array_key_exists("email_verified_at", $data) ? $data["email_verified_at"] : null;
        $this->photo_path = array_key_exists("photo_path", $data) ? $data["photo_path"] : null;
        $this->status = $data["status"];
        $this->role = $data["role"];
        $this->created_by = $data["created_by"];
    }


    public function use () : array {

        return [

            "name" => $this->name,
            "email" => $this->email,
            "title" => $this->title,
            "password" => $this->password,
            "email_verified_at" => $this->email_verified_at,
            "photo_path" => $this->photo_path,
            "status" => $this->status,
            "created_by" => $this->created_by, 
            "department_id" => 1
        ];

    }
}