<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    /**
     * List all permissions, grouped by "group_name" field.
     */
    public function index()
    {
        $permissions = Permission::orderBy("created_at")
            ->get(['id', 'name', 'label', 'group_name']);
    
        $grouped = [];
    
        foreach ($permissions as $perm) {
            $groupName = $perm->group_name;
            if (!isset($grouped[$groupName])) {
                $grouped[$groupName] = [];
            }
    
            $grouped[$groupName][] = [
                'id'           => $perm->id,
                'name'         => $perm->name,
            ];
        }
    
        return response()->json(["status" => true, "message" => "", "data" => $grouped]);
    }

    public function indexPermissions(Request $request)
    {

        $query = Permission::query();

        if ($request->filled("group_name"))
            $query->where("group_name", $request->group_name);

        if ($search = request('search')) {
            $query->where('name', 'like', "%$search%");
        }

        $perPage = $request->integer("perPage", 10);
        $order = $request->str("order", "desc");

        $permissions = $query->orderBy("created_at", $order)
            ->paginate($perPage, ['id', 'name', 'label', 'group_name']);

        if ($permissions->isEmpty()) {
            return response()->json(["status" => false, "message" => "No permissions found !", "data" => []], 200);
        }
    
        return response()->json(["status" => true, "message" => "", "data" => $permissions]);
    }
    
    public function indexPermissionsForFrontAuthintication ()
    {
        $userId = Auth::id();

        $user = User::find($userId);

        $permissions = $user->getAllPermissions()->map(function ($p) {
            return $p->name;
        });

        return response()->json(["status" => true, "message" => "", "data" => $permissions]);
    }

    /**
     * Store a newly created permission.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|unique:permissions,name',
            'group' => 'nullable|string',
        ]);

        $permission = Permission::create($data);

        return response()->json([
            'status' => true,
            'message' => 'Permission created successfully',
            'data' => $permission
        ], 201);
    }

    /**
     * Display a single permission
     */
    public function show(string $id)
    {
        $permission = Permission::find($id);

        if (!$permission) {
            return response()->json([
                'status' => false,
                'message' => 'Permission not found'
            ], 404);
        }

        return response()->json($permission);
    }

    /**
     * Update a permission
     */
    public function update(Request $request, string $id)
    {
        $permission = Permission::find($id);

        if (!$permission) {
            return response()->json([
                'status' => false,
                'message' => 'Permission not found'
            ], 404);
        }

        $data = $request->validate([
            'name' => 'required|string|unique:permissions,name,' . $id,
            'group' => 'nullable|string',
        ]);

        $permission->update($data);

        return response()->json([
            'status' => true,
            'message' => 'Permission updated successfully',
            'data' => $permission
        ]);
    }

    /**
     * Delete a permission
     */
    public function destroy(Request $request)
    {
        $ids = $request->validate([
            "ids" => "required|array",
            "ids.*" => "integer"
        ]);

        Permission::whereIn("id", $ids)->delete();

        return response()->json(["status" => true, "message" => "Permission successfully deleted !"], 200);
    }
}
