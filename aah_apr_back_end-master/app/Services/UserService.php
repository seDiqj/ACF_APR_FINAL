<?php

namespace App\Services;

use App\Constants\PaginationConfig;
use App\Constants\System;
use App\DTOs\CreateUserDTO;
use App\DTOs\DestroyItemsDTO;
use App\DTOs\IndexUserDTO;
use App\DTOs\UpdateUserDTO;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Collection;


class UserService {

    public function getUsers(IndexUserDTO $dto): LengthAwarePaginator | string {

        $query = User::query()->with('updater');

        $query->when($dto->name, fn($q) => $q->where('name', "like", "%" . $dto->name , "%"));
        $query->when($dto->email, fn($q) => $q->where('email', "like", "%" . $dto->email . "%"));
        $query->when($dto->title, fn($q) => $q->where('title', "like", "%" . $dto->title . "%"));
        $query->when($dto->status, fn($q) => $q->where('status', "like", "%" . $dto->status . "%"));
        $query->when($dto->created_at, fn($q) => $q->whereDate('created_at', "like", "%" . $dto->created_at . "%"));
        $query->when($dto->search, fn($q) => $q->where('name', 'like', "%{$dto->search}%"));

        $users = $query->paginate(PaginationConfig::USERS_PER_PAGE);

        if ($users->getCollection()->isEmpty()) return System::NO_RECORDS;

        $users->getCollection()->transform(function ($user) {
            $user->updated_by = $user->updater?->name; 
            unset($user->updater); 
            return $user;
        });

        return $users;
        
    }

    public function createUser (CreateUserDTO $dto): User | string {

        $user = User::create($dto->use());

        if ($dto->role) {
            $user->assignRole($dto->role);
        }

        if ($dto->photo_path) {
            $user['photo_path'] = asset('storage/' . $dto->photo_path);
        }

        return $user;

    }

    public function showUser (string $id): array | string {

        $user = $this->getUser($id);

        if (!$user) return System::SYSTEM_404;

        $photo = $user->photo_path ? asset('storage/' . $user->photo_path) : null;

        $roles = $user->getRoleNames();

        $permissions = $user->getAllPermissions()->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'label' => $p->label,
                'group_name' => $p->group_name ?? null,
            ];
        });

        $user["photo"] = $photo;
        $user["roles"] = $roles;
        $user["permissions"] = $permissions;

        return [
            'id' => $user->id,
            'name' => $user->name,
            'title' => $user->title ?? null,
            'email' => $user->email,
            'photo_path' => $user->photo,
            'status' => $user->status,
            'roles' => $user->roles,
            'permissions' => $user->permissions,
        ];

    }

    public function updateUser (UpdateUserDTO $dto, string $id): string {

        $user = $this->getUser($id);

        if ($user == System::SYSTEM_404)
            return response()->json(["status" => false, "message" => "No such user in system !", "data" => []], 404);

        $user->update($dto->use());

        if ($dto->role) {
            $user->syncRoles([$dto->role]);
        }

        if ($dto->photo_path) {
            $user->photo_path = asset('storage/' . $dto->photo_path);
        } elseif ($user->photo_path) {
            $user->photo_path = asset('storage/' . $user->photo_path);
        }

        return $user;
    }

    public function deleteUser (string $id): true | string {

        $user = $this->getUser($id);

        if ($user == System::SYSTEM_404)
            return System::SYSTEM_404;

        $user->delete();

        return true;

    }

    public function deleteUsers (DestroyItemsDTO $dto): true | string {

        User::whereIn("id", $dto->ids)->delete();

        return true;

    }

    public function getSystemPermissions (bool $grouped = false): mixed {

        $systemPermissions = Permission::all()->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'label' => $p->label,
                'group_name' => $p->group_name ?? null,
            ];
        });

        if ($grouped)
            $systemPermissions = $systemPermissions->groupBy('group_name')->map(function ($group) {
                                    return $group->values();
                                });

        return $systemPermissions;

    }

    public function getUserPermissions (string $id): mixed {

        $user = User::find($id);

        if (!$user) return System::SYSTEM_404;   
        
        $userPermissions = $user->getAllPermissions()->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'label' => $p->label,
                'group_name' => $p->group_name ?? null,
            ];
        });

        return $userPermissions;

    }

    public function getSystemActiveRoles (): Collection {

        return Role::with("permissions")->where("status", "==", "active")->get();

    }

    private function getUser (string $id): User | string {

        $user = User::find($id);

        if (!$user) return System::SYSTEM_404;

        return $user;
    }
}