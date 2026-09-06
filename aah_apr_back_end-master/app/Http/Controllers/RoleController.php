<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;

class RoleController extends Controller
{
    public function index(Request $request)
    {
         $query = Role::query();

        if ($request->filled("name")) {
            $names = explode(',', $request->input('name'));
            $query->whereIn('name', $names);

        }
        
        if ($request->filled("status")) {
            $status = $request->input('status');
            $query->whereIn('status', $status);
        }
           
        if (request("search")) {
            $names = explode(',', $request->input('search'));
            $query->whereIn('name', $names);
        }

        $perPage = $request->integer("perPage", 10);
        $order = $request->str("order", "desc");

        $roles = $query->orderBy("created_at", $order)->paginate($perPage);

        if ($roles->isEmpty()) {
            return response()->json([
                "status" => false,
                "message" => "No role was found !",
                "data" => []
            ], 200);
        }

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $roles
        ]);
    }

    public function store(Request $request)
    {

        $data = $request->validate([
            "name" => "required|min:3",
            "status" => "required|in:active,deactive",
            "permissions" => "required|array",
            "permissions.*" => "integer"
        ]);

        DB::beginTransaction();
        try {
            $role = Role::create([
                'name' => $data['name'],
                'guard_name' => 'web', 
                "status" => $data["status"]
            ]);

            $role->syncPermissions($data['permissions']);

            DB::commit();
            return response()->json([
                "status" => true,
                "message" => "Role successfully created !",
                "data" => $role->load('permissions')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                "status" => false,
                "message" => "Something went wrong !",
                "error" => $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id)
    {
        $role = Role::with('permissions')->find($id);

        if (!$role) {
            return response()->json([
                "status" => false,
                "message" => "No such role in our records !"
            ], 404);
        }

        return response()->json([
            "status" => true,
            "message" => "",
            "data" => $role
        ]);
    }

    public function update(Request $request, string $id)
    {
        $data = $request->validate([
            "name" => "sometimes|string|min:3",
            "status" => 'required|in:active,deactive',
            "permissions" => "sometimes|array",
            "permissions.*" => "integer"
        ]);

        $role = Role::find($id);
        if (!$role) {
            return response()->json([
                "status" => false,
                "message" => "No such role in our records !"
            ], 404);
        }

        DB::beginTransaction();
        try {
            // update name/status
            if (isset($data['name'])) {
                $role->name = $data['name'];
            }
            $role->status = $data['status'];
            $role->save();

            // update permissions if provided
            if (isset($data['permissions'])) {
                $role->syncPermissions($data['permissions']);
            }

            DB::commit();
            return response()->json([
                "status" => true,
                "message" => "Role successfully updated !",
                "data" => $role->load('permissions')
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                "status" => false,
                "message" => "Something went wrong !",
                "error" => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Request $request)
    {
        $data = $request->validate([
            "ids" => "required|array",
            "ids.*" => "integer"
        ]);

        Role::whereIn("id", $data['ids'])->delete();

        return response()->json([
            "status" => true,
            "message" => "Roles successfully deleted !"
        ], 200);
    }
}
