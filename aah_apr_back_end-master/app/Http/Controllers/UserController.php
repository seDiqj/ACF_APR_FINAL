<?php

namespace App\Http\Controllers;

use App\Constants\System;
use App\Generators\DtoGenerator;
use App\Http\Requests\DestroyItemsRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\ValidateUserRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{

    public function index(Request $request)
    {
        $query = User::query()->with('updater');

        $query->when($request->filled('name'), function ($q) use ($request) {
            $names = $request->input('name');
            $q->whereIn('name', $names);
        });
        $query->when($request->filled('email'), function ($q) use ($request) {
            $emails = explode(',', $request->input('email'));
            $q->whereIn('email', $emails);
        });
        $query->when($request->filled('title'), function ($q) use ($request) {
            $titles = explode(',', $request->input('title'));
            $q->whereIn('title', $titles);
        });
        $query->when($request->filled('status'), function ($q) use ($request) {
            $q->whereIn('status', $request->input('status'));
        });
        $query->when($request->filled('created_at'), function ($q) use ($request) {
            $dates = explode(',', $request->input('created_at'));
            $q->whereDate('created_at', $dates);
        });

        $query->when($request->input('search'), function ($q) use ($request) {
            $names = $request->input('search');
            $q->whereIn('name', $names);
        }
        );

        $perPage = $request->integer("perPage", 10);
        $order = $request->str("order", "desc");

        $users = $query->orderBy("created_at", $order)->paginate($perPage);

        if ($users->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No user was found!",
                "data" => []
            ], 200);
        }

        $users->getCollection()->transform(function ($user) {
            $user->updated_by = $user->updater?->name; 
            unset($user->updater); 
            return $user;
        });

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $users
        ], 200);
    }

    public function store(ValidateUserRequest $request, DtoGenerator $dtoGenerator, UserService $service)
    {
        $dto = $dtoGenerator->generateCreateUserDto($request);

        $user = $service->createUser($dto);

        return response()->json([
            'status' => true,
            'message' => 'User Created Successfully!',
            'data' => $user,
        ]);
    }

    public function show(string $id, UserService $service)
    {
        // User | string
        $user = $service->showUser($id);

        if ($user == System::SYSTEM_404) {
            return response()->json([
                "status" => false,
                "message" => "No such user in database!"
            ], 404);    
        }

        return response()->json([
            "status" => true,
            "message" => "User retrieved successfully",
            "data" => $user,
        ], 200);
    }

    public function update(UpdateUserRequest $request, string $id, DtoGenerator $dtoGenerator, UserService $service)
    {

        $dto = $dtoGenerator->generateUpdateUserDto($request);

        $user = $service->updateUser($dto, $id);
        
        return response()->json([
            'status' => true,
            'message' => 'User Updated Successfully!',
            'data' => $user,
        ]);
    }

    public function destroy(DestroyItemsRequest $request, DtoGenerator $dtoGenerator)
    {
        
        $dto = $dtoGenerator->generateDestroyItemsDto($request);

        User::whereIn("id", $dto->ids)->delete();

        return response()->json(["status" => true, "message" => "Users successfully deleted !"], 200);
        
    }

    public function me (UserService $service)
    {
        $id = Auth::id();

        $user = $service->showUser($id);

        if ($user == System::SYSTEM_404)
            return response()->json(["status" => false, "message" => "No such user in system", "data" => []], 404);

        return response()->json([
            "status" => true,
            "message" => "User retrieved successfully",
            "data" => $user
        ], 200);
    }

    public function changeUserPassword(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::findOrFail($id);

        $user->password = Hash::make($request->input('password'));
        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Password changed successfully!',
        ]);
    }

    public function getSystemAndUserPermissions(string $id, UserService $service) 
    {
        $systemPermissions = $service->getSystemPermissions(true);

        $userPermissions = $service->getUserPermissions($id);

        if ($userPermissions == System::SYSTEM_404) {
            return response()->json([
                "status" => false,
                "message" => "No such user in database!",
                "data" => []
            ], 404);    
        }

        return response()->json([
            "status" => true,
            "message" => "Permissions retrieved successfully",
            "data" => [
                'system_permissions' => $systemPermissions,
                'user_permissions' => $userPermissions,
            ]
        ], 200);
    }

    public function getAllRolesAndPermissions()
    {
        $systemPermissions = Permission::all()->map(function ($p) {
            return [
                'id' => $p->id,
                'name' => $p->name,
                'label' => $p->label,
                'group_name' => $p->group_name ?? null,
            ];
        });

        $groupedPermissions = $systemPermissions->groupBy('group_name')->map(function ($group) {
            return $group->values();
        });

        $systemRoles = Role::with("permissions")->where("status", "!=", "deactive")->get();

        $finalData = [
            "permissions" => $groupedPermissions,
            "roles" => $systemRoles
        ];

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $finalData
        ], 200);
    }

}
