<?php

namespace App\DTOs;

class UpdateUserDTO
{
    public string $name;
    public string $email;
    public string $title;

    public ?string $password;
    public ?string $email_verified_at;
    public ?string $photo_path;

    public string $status;

    /**
     * User can have only one role.
     */
    public ?string $role;

    /**
     * Direct permissions assigned specifically to the user.
     *
     * These are separate from permissions inherited from the role.
     */
    public array $permissions;

    public int $updated_by;


    public function __construct(array $data)
    {
        $this->name = $data['name'];
        $this->email = $data['email'];
        $this->title = $data['title'];

        $this->password = array_key_exists('password', $data)
            ? $data['password']
            : null;

        $this->email_verified_at = array_key_exists('email_verified_at', $data)
            ? $data['email_verified_at']
            : null;

        $this->photo_path = array_key_exists('photo_path', $data)
            ? $data['photo_path']
            : null;

        $this->status = $data['status'];

        /*
         * Role is nullable so the user can have no role.
         */
        $this->role = array_key_exists('role', $data)
            ? $data['role']
            : null;

        /*
         * Direct permissions.
         *
         * Empty array means the user has no additional
         * direct permissions.
         */
        $this->permissions = array_key_exists('permissions', $data)
            ? $data['permissions']
            : [];

        $this->updated_by = $data['updated_by'];
    }


    /**
     * Return only fields that belong to the users table.
     *
     * role and permissions are intentionally excluded because
     * Spatie manages them through its own tables.
     */
    public function use(): array
    {
        $data = [
            'name' => $this->name,
            'email' => $this->email,
            'title' => $this->title,
            'status' => $this->status,
            'updated_by' => $this->updated_by,
            'department_id' => 1,
        ];

        /*
         * Password should only be updated when a new password
         * was actually provided.
         */
        if ($this->password !== null) {
            $data['password'] = $this->password;
        }

        /*
         * email_verified_at can legitimately be null.
         * Therefore we check for !== null rather than truthiness.
         */
        if ($this->email_verified_at !== null) {
            $data['email_verified_at'] = $this->email_verified_at;
        }

        /*
         * photo_path is only included when a new photo was uploaded.
         * The existing photo will remain untouched otherwise.
         */
        if ($this->photo_path !== null) {
            $data['photo_path'] = $this->photo_path;
        }

        return $data;
    }
}