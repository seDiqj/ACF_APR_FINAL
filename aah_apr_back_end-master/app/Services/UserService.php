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
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserService
{
    /**
     * Get paginated users.
     */
    public function getUsers(IndexUserDTO $dto): LengthAwarePaginator|string
    {
        $query = User::query()->with('updater');

        $query->when(
            $dto->name,
            fn ($q) => $q->where('name', 'like', "%{$dto->name}%")
        );

        $query->when(
            $dto->email,
            fn ($q) => $q->where('email', 'like', "%{$dto->email}%")
        );

        $query->when(
            $dto->title,
            fn ($q) => $q->where('title', 'like', "%{$dto->title}%")
        );

        $query->when(
            $dto->status,
            fn ($q) => $q->where('status', 'like', "%{$dto->status}%")
        );

        $query->when(
            $dto->created_at,
            fn ($q) => $q->whereDate('created_at', $dto->created_at)
        );

        $query->when(
            $dto->search,
            fn ($q) => $q->where(function ($query) use ($dto) {
                $query
                    ->where('name', 'like', "%{$dto->search}%")
                    ->orWhere('email', 'like', "%{$dto->search}%")
                    ->orWhere('title', 'like', "%{$dto->search}%");
            })
        );

        $users = $query
            ->orderBy('created_at', 'desc')
            ->paginate(PaginationConfig::USERS_PER_PAGE);

        if ($users->getCollection()->isEmpty()) {
            return System::NO_RECORDS;
        }

        $users->getCollection()->transform(function ($user) {

            $user->updated_by = $user->updater?->name;

            unset($user->updater);

            /*
             * Keep photo_path as the database path.
             * Generate public URL separately.
             */
            $user->photo = $user->photo_path
                ? asset('storage/' . $user->photo_path)
                : null;

            return $user;
        });

        return $users;
    }


    /**
     * Create user.
     *
     * Role permissions are inherited automatically by Spatie.
     *
     * Direct permissions are stored separately.
     */
    public function createUser(CreateUserDTO $dto): User
    {
        return DB::transaction(function () use ($dto) {

            /*
             * Create basic user information.
             */
            $user = User::create($dto->use());


            /*
             * Assign role.
             */
            if ($dto->role) {

                $this->validateRole($dto->role);

                $user->assignRole($dto->role);
            }


            /*
             * Store only additional/direct permissions.
             *
             * Permissions already inherited from the role
             * will NOT be stored as direct permissions.
             */
            $directPermissions = $this->getDirectPermissions(
                $user,
                $dto->permissions ?? []
            );

            $user->syncPermissions($directPermissions);


            return $user
                ->fresh()
                ->load('roles');
        });
    }


    /**
     * Get user details.
     */
    public function showUser(string $id): array|string
    {
        $user = $this->getUser($id);

        if (!$user) {
            return System::SYSTEM_404;
        }

        /*
         * Load roles and their permissions.
         */
        $user->load('roles.permissions');


        /*
         * Direct permissions only.
         */
        $directPermissions = $user
            ->getDirectPermissions()
            ->map(fn ($permission) => $this->formatPermission($permission))
            ->values();


        /*
         * Effective permissions:
         *
         * Role permissions + Direct permissions.
         *
         * Spatie handles this automatically.
         */
        $permissions = $user
            ->getAllPermissions()
            ->map(fn ($permission) => $this->formatPermission($permission))
            ->values();


        /*
         * User roles.
         */
        $roles = $user
            ->getRoleNames()
            ->values();


        return [
            'id' => $user->id,

            'name' => $user->name,

            'title' => $user->title ?? null,

            'email' => $user->email,

            /*
             * Original path stored in DB.
             */
            'photo_path' => $user->photo_path,

            /*
             * Public URL.
             */
            'photo' => $user->photo_path
                ? asset('storage/' . $user->photo_path)
                : null,

            'status' => $user->status,

            /*
             * Roles assigned to user.
             */
            'roles' => $roles,

            /*
             * All effective permissions.
             *
             * Role permissions + Direct permissions.
             */
            'permissions' => $permissions,

            /*
             * Permissions assigned directly to user.
             */
            'direct_permissions' => $directPermissions,
        ];
    }


    /**
     * Update user.
     */
    public function updateUser(
        UpdateUserDTO $dto,
        string $id
    ): User|string {
        $user = $this->getUser($id);

        if (!$user) {
            return System::SYSTEM_404;
        }

        return DB::transaction(function () use ($user, $dto) {

            /*
             * Get normal user fields.
             */
            $data = $dto->use();


            /*
             * Role and permissions do not belong
             * to the users table.
             */
            unset($data['role']);
            unset($data['permissions']);


            /*
             * Store photo path only.
             *
             * Example:
             *
             * users/profile/abc.jpg
             *
             * NOT:
             *
             * https://example.com/storage/users/profile/abc.jpg
             */
            if ($dto->photo_path) {
                $data['photo_path'] = $dto->photo_path;
            }


            /*
             * Update basic user information.
             */
            $user->update($data);


            /*
             * Synchronize role.
             *
             * If a role is selected:
             * assign that role.
             *
             * If no role is selected:
             * remove all roles.
             */
            if ($dto->role) {

                $this->validateRole($dto->role);

                $user->syncRoles([
                    $dto->role
                ]);

            } else {

                $user->syncRoles([]);
            }


            /*
             * Synchronize direct permissions.
             *
             * Role permissions are automatically excluded.
             */
            $user->refresh();

            $directPermissions = $this->getDirectPermissions(
                $user,
                $dto->permissions ?? []
            );

            $user->syncPermissions($directPermissions);


            return $user
                ->fresh()
                ->load('roles');
        });
    }


    /**
     * Delete one user.
     */
    public function deleteUser(string $id): bool|string
    {
        $user = $this->getUser($id);

        if (!$user) {
            return System::SYSTEM_404;
        }

        $user->delete();

        return true;
    }


    /**
     * Delete multiple users.
     */
    public function deleteUsers(
        DestroyItemsDTO $dto
    ): bool|string {

        User::whereIn('id', $dto->ids)->delete();

        return true;
    }


    /**
     * Get system permissions.
     */
    public function getSystemPermissions(
        bool $grouped = false
    ): mixed {

        $permissions = Permission::query()
            ->orderBy('group_name')
            ->orderBy('name')
            ->get()
            ->map(
                fn ($permission) =>
                    $this->formatPermission($permission)
            );


        if ($grouped) {

            return $permissions
                ->groupBy('group_name')
                ->map(
                    fn ($group) => $group->values()
                );
        }


        return $permissions;
    }


    /**
     * Get all effective permissions of a user.
     *
     * Includes:
     *
     * - Role permissions
     * - Direct permissions
     */
    public function getUserPermissions(
        string $id
    ): mixed {

        $user = User::find($id);

        if (!$user) {
            return System::SYSTEM_404;
        }

        return $user
            ->getAllPermissions()
            ->map(
                fn ($permission) =>
                    $this->formatPermission($permission)
            )
            ->values();
    }


    /**
     * Get direct permissions only.
     */
    public function getUserDirectPermissions(
        string $id
    ): mixed {

        $user = User::find($id);

        if (!$user) {
            return System::SYSTEM_404;
        }

        return $user
            ->getDirectPermissions()
            ->map(
                fn ($permission) =>
                    $this->formatPermission($permission)
            )
            ->values();
    }


    /**
     * Get active system roles.
     */
    public function getSystemActiveRoles(): Collection
    {
        return Role::with('permissions')
            ->where('status', 'active')
            ->get();
    }


    /**
     * Get user.
     */
    private function getUser(string $id): ?User
    {
        return User::find($id);
    }


    /**
     * Validate role.
     */
    private function validateRole(string $role): void
    {
        $exists = Role::query()
            ->where('name', $role)
            ->where('status', 'active')
            ->exists();


        if (!$exists) {

            abort(
                response()->json([
                    'status' => false,

                    'message' =>
                        'The selected role does not exist or is inactive.',

                    'data' => [],
                ], 422)
            );
        }
    }


    /**
     * Get only direct permissions.
     *
     * Any permission already provided by the user's role
     * will be removed from the direct permission list.
     */
    private function getDirectPermissions(
        User $user,
        array $permissions
    ): array {

        if (empty($permissions)) {
            return [];
        }


        /*
         * Get all permissions inherited from user's roles.
         */
        $rolePermissionNames = $user
            ->roles
            ->load('permissions')
            ->flatMap(function ($role) {

                return $role
                    ->permissions
                    ->pluck('name');
            })
            ->unique()
            ->values();


        /*
         * Normalize incoming permissions.
         *
         * Supports:
         *
         * [
         *     "create_user",
         *     "delete_user"
         * ]
         *
         * And:
         *
         * [
         *     ["name" => "create_user"],
         *     ["name" => "delete_user"]
         * ]
         */
        $permissionNames = collect($permissions)
            ->map(function ($permission) {

                if (is_array($permission)) {

                    return $permission['name'] ?? null;
                }

                return $permission;
            })
            ->filter()
            ->unique()
            ->values();


        /*
         * Remove permissions already inherited
         * from the role.
         */
        return $permissionNames
            ->diff($rolePermissionNames)
            ->values()
            ->all();
    }


    /**
     * Format permission for API.
     */
    private function formatPermission(
        Permission $permission
    ): array {

        return [
            'id' => $permission->id,

            'name' => $permission->name,

            'label' => $permission->label,

            'group_name' =>
                $permission->group_name ?? null,
        ];
    }
}