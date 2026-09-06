<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthenticationController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();

        if ($user->status == "deactive") {
            return response()->json(["status" => false, "message" => "Your account has been disabled for some reason."], 403);
        } 

        else if ($user->status == "blocked") {

            return response()->json(["status" => false, "message" => "Your account has been blocked for some reason."], 403);

        }
        

        $abilities = ['*'];
        $expiration = $request->remember ? now()->addDays(30) : now()->addHours(2);

        $token = $user->createToken("remember_token", $abilities, $expiration)->plainTextToken;

        return response()->json([
            "status" => true,
            "message" => "Logged Successfully",
            'access_token' => $token,
            "token_type" => "Bearer",
            'user' => $user
        ]);
    }

    public function logout(Request $request) {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            "status" => true,
            "message" => "Logged out !"
        ], 200);
    }
}