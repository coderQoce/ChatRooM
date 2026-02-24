<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'username' => 'required|string|min:2',
                'password' => 'required|string|min:6',
            ]);

            $existingEmail = User::where('email', strtolower($request->email))->first();
            $existingUsername = User::where('username', $request->username)->first();

            if ($existingEmail || $existingUsername) {
                return response()->json([
                    'success' => false,
                    'message' => 'User with this email or username already exists',
                ], 400);
            }

            // Generate unique 6-char code
            do {
                $uniqueCode = strtoupper(Str::random(6));
            } while (User::where('unique_code', $uniqueCode)->exists());

            $user = User::create([
                'email' => strtolower($request->email),
                'username' => $request->username,
                'password' => $request->password,
                'unique_code' => $uniqueCode,
                'profile_picture' => null,
                'status' => 'online',
                'last_seen' => now(),
                'friends' => [],
            ]);

            $token = JWTAuth::fromUser($user);

            return response()->json([
                'success' => true,
                'token' => $token,
                'user' => $user->toSafeArray(),
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating account',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            $user = User::where('email', strtolower($request->email))->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid email or password',
                ], 401);
            }

            $user->update([
                'status' => 'online',
                'last_seen' => now(),
            ]);

            $token = JWTAuth::fromUser($user);

            return response()->json([
                'success' => true,
                'token' => $token,
                'user' => $user->toSafeArray(),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error logging in',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $user = auth('api')->user();
            $user->update([
                'status' => 'offline',
                'last_seen' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error logging out',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getProfile(Request $request)
    {
        try {
            $user = auth('api')->user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User not found'], 404);
            }

            return response()->json([
                'success' => true,
                'user' => $user->toSafeArray(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching profile',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function verifyToken(Request $request)
    {
        try {
            $user = auth('api')->user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User not found'], 404);
            }

            return response()->json([
                'success' => true,
                'user' => $user->toSafeArray(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error verifying token',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
