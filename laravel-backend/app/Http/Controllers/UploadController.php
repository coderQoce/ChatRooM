<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class UploadController extends Controller
{
    public function uploadAvatar(Request $request)
    {
        try {
            $request->validate([
                'avatar' => 'required|image|mimes:jpeg,png,gif,webp|max:5120',
            ]);

            $user = auth('api')->user();

            // Delete old avatar if exists
            if ($user->profile_picture) {
                $oldPath = public_path($user->profile_picture);
                if (File::exists($oldPath)) {
                    File::delete($oldPath);
                }
            }

            // Ensure directory exists
            $uploadDir = public_path('uploads/avatars');
            if (!File::isDirectory($uploadDir)) {
                File::makeDirectory($uploadDir, 0755, true);
            }

            $file = $request->file('avatar');
            $filename = $user->id . '-' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($uploadDir, $filename);

            $profilePicture = '/uploads/avatars/' . $filename;
            $user->update(['profile_picture' => $profilePicture]);

            return response()->json([
                'success' => true,
                'user' => $user->toSafeArray(),
                'profilePicture' => $profilePicture,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error uploading avatar',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function removeAvatar(Request $request)
    {
        try {
            $user = auth('api')->user();

            if ($user->profile_picture) {
                $oldPath = public_path($user->profile_picture);
                if (File::exists($oldPath)) {
                    File::delete($oldPath);
                }
            }

            $user->update(['profile_picture' => null]);

            return response()->json([
                'success' => true,
                'message' => 'Profile picture removed',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error removing avatar',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
