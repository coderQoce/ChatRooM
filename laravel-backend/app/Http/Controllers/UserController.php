<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Message;
use App\Models\FriendRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function searchByCode(Request $request)
    {
        try {
            $code = $request->query('code');

            if (!$code || strlen($code) !== 6) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please provide a valid 6-character code',
                ], 400);
            }

            $user = User::where('unique_code', strtoupper($code))->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found with this code',
                ], 404);
            }

            $currentUser = auth('api')->user();
            $friends = $currentUser->friends ?? [];
            $isFriend = in_array((string) $user->id, $friends);

            $safeUser = $user->toSafeArray();
            unset($safeUser['friends']);

            return response()->json([
                'success' => true,
                'user' => $safeUser,
                'isFriend' => $isFriend,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error searching user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function searchByUsername(Request $request)
    {
        try {
            $username = $request->query('username');

            if (!$username || strlen(trim($username)) < 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'Username must be at least 2 characters',
                ], 400);
            }

            $currentUser = auth('api')->user();
            
            // Exclude current user from search
            $user = User::where('username', 'LIKE', '%' . trim($username) . '%')
                ->where('id', '!=', $currentUser->id)
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }

            $friends = $currentUser->friends ?? [];
            $isFriend = in_array((string) $user->id, $friends);

            $safeUser = $user->toSafeArray();
            unset($safeUser['friends']);

            return response()->json([
                'success' => true,
                'user' => $safeUser,
                'isFriend' => $isFriend,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error searching user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getUserById($userId)
    {
        try {
            $user = User::find($userId);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'user' => $user->toSafeArray(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching user',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $currentUser = auth('api')->user();
            $allowedUpdates = ['username', 'profile_picture', 'status'];
            $updates = [];

            // Map camelCase from frontend to snake_case
            $fieldMap = [
                'username' => 'username',
                'profilePicture' => 'profile_picture',
                'status' => 'status',
            ];

            foreach ($fieldMap as $frontendKey => $dbKey) {
                if ($request->has($frontendKey)) {
                    $updates[$dbKey] = $request->input($frontendKey);
                }
            }

            // Also accept snake_case directly
            foreach ($allowedUpdates as $key) {
                if ($request->has($key) && !isset($updates[$key])) {
                    $updates[$key] = $request->input($key);
                }
            }

            if (isset($updates['username']) && $updates['username'] !== $currentUser->username) {
                $existing = User::where('username', $updates['username'])
                    ->where('id', '!=', $currentUser->id)
                    ->first();

                if ($existing) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Username already taken',
                    ], 400);
                }
            }

            $currentUser->update($updates);
            $currentUser->refresh();

            return response()->json([
                'success' => true,
                'user' => $currentUser->toSafeArray(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating profile',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function deleteAccount(Request $request)
    {
        try {
            $user = auth('api')->user();

            // Delete avatar file
            if ($user->profile_picture) {
                $path = public_path($user->profile_picture);
                if (file_exists($path)) {
                    unlink($path);
                }
            }

            // Remove user from all friends lists
            $allUsers = User::whereJsonContains('friends', (string) $user->id)->get();
            foreach ($allUsers as $otherUser) {
                $friends = $otherUser->friends ?? [];
                $friends = array_values(array_filter($friends, fn($id) => $id !== (string) $user->id));
                $otherUser->update(['friends' => $friends]);
            }

            // Delete messages
            Message::where('sender_id', $user->id)->orWhere('receiver_id', $user->id)->delete();

            // Delete friend requests
            FriendRequest::where('sender_id', $user->id)->orWhere('receiver_id', $user->id)->delete();

            // Delete user
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'Account deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting account',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getAllUsers()
    {
        try {
            $users = User::all()->map(fn($u) => $u->toSafeArray());

            return response()->json([
                'success' => true,
                'users' => $users,
                'count' => $users->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching users',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
