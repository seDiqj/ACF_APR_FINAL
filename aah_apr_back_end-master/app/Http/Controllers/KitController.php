<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Kit;
use Illuminate\Validation\Rule;

class KitController extends Controller
{
    public function index (Request $request) {

        $perPage = $request->integer("perPage", 10);
        $order = $request->str("order", "desc");

        $kits = Kit::orderBy("created_at", $order)->paginate($perPage);

        if ($kits->isEmpty()) return response()->json(["status" => false, "message" => "No kit was found !", "data" => []], 200);

        $kits = $kits->map(function ($kit) {
            unset($kit->created_at, $kit->updated_at, $kit->deleted_at);

            return $kit;
        });

        return response()->json(["status" => true, "message" => "", "data" => $kits], 200);
    }

    public function store (Request $request) {
        
        $validated = $request->validate([
            "name" => ["required", "string", "min:3", "max:255",  Rule::unique('projects', 'projectCode')->whereNull('deleted_at')],
            "description" => "required|string|min:3",
            "status" => "required|in:active,inactive",
        ]);

        Kit::create($validated);

        return response()->json(["status" => true, "message" => "New kit successfully created !"], 200);

    }

    public function show (string $id) {

        $kit = Kit::find($id);

        if (!$kit) return response()->json(["status" => false, "message" => "No such kit in system !"], 404);

        unset($kit->created_at, $kit->updated_at, $kit->deleted_at);

        return response()->json(["status" => true, "message" => "", "data" => $kit], 200);

    }

    public function update (Request $request, string $id) {

        $kit = Kit::find($id);

        if (!$kit) return response()->json(["status" => false, "message" => "No such kit in system !"], 404);

        $validated = $request->validate([
            "name" => "required|string|min:3|max:255",
            "description" => "required|string|min:3",
            "status" => "required|in:active,inactive",
        ]);

        $kit->update($validated);

        return response()->json(["status" => true, "message" => "Kit successfully updated !"], 200);

    }

    public function destroy (Request $request) {

        $ids = $request->input("ids");

        $request->validate([
            "ids" => "required|array",
            "ids.*" => "integer"
        ]);

        $kits = Kit::whereIn("id", $ids)->get();

        foreach ($kits as $kit) {
            $kit->delete(); 
        }

        return response()->json(["status" => true, "message" => "Seleted kits successfully deleted!"], 200);

    }
}
