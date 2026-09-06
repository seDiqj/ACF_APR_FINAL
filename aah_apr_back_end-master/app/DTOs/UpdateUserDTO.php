<?php

namespace App\DTOs;

class UpdateUserDTO {

    public string $name;
    public string $email;
    public string $title;
    public string | null $password;
    public string | null $email_verified_at;
    public string | null $photo_path;
    public string $status;
    public string $role;
    public int $created_by;
    public int $updated_by;

    public function __construct(array $data)
    {
        $this->name = $data["name"];
        $this->email = $data["email"];
        $this->title = $data["title"];
        $this->password = array_key_exists("password", $data) ? $data["password"] : null;
        $this->email_verified_at = array_key_exists("email_verified_at", $data) ? $data["email_verified_at"] : null;
        $this->photo_path = array_key_exists("photo_path", $data) ? $data["photo_path"] : null;
        $this->status = $data["status"];
        $this->role = $data["role"];
        $this->updated_by = $data["updated_by"];
    }

    public function use () : array {

        $arrayToUse = [
            "name" => $this->name,
            "email" => $this->email,
            "title" => $this->title,
            "status" => $this->status,
            "updated_by" => $this->updated_by,
            "department_id" => 1,
            "role" => $this->role,
        ];

        if ($this->password) $arrayToUse["password"] = $this->password;
        if ($this->email_verified_at) $arrayToUse["email_verified_at"] = $this->email_verified_at;
        if ($this->photo_path) $arrayToUse["photo_path"] = $this->photo_path;

        return $arrayToUse;

    }
}