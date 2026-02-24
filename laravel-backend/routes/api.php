<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\UploadController;

// Auth routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::middleware('auth.jwt')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/profile', [AuthController::class, 'getProfile']);
        Route::get('/verify', [AuthController::class, 'verifyToken']);
    });
});

// User routes
Route::prefix('user')->middleware('auth.jwt')->group(function () {
    Route::get('/search', [UserController::class, 'searchByCode']);
    Route::get('/search/username', [UserController::class, 'searchByUsername']);
    Route::get('/', [UserController::class, 'getAllUsers']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::delete('/account', [UserController::class, 'deleteAccount']);
    Route::get('/{userId}', [UserController::class, 'getUserById']);
});

// Friends routes
Route::prefix('friends')->middleware('auth.jwt')->group(function () {
    Route::get('/', [FriendController::class, 'getFriends']);
    Route::post('/add/{userId}', [FriendController::class, 'addFriend']);
    Route::post('/request/{userId}', [FriendController::class, 'sendRequest']);
    Route::post('/accept/{requestId}', [FriendController::class, 'acceptRequest']);
    Route::post('/reject/{requestId}', [FriendController::class, 'rejectRequest']);
    Route::delete('/remove/{userId}', [FriendController::class, 'removeFriend']);
});

// Messages routes
Route::prefix('messages')->middleware('auth.jwt')->group(function () {
    Route::post('/', [MessageController::class, 'sendMessage']);
    Route::get('/chats', [MessageController::class, 'getChats']);
    Route::get('/conversation/{userId}', [MessageController::class, 'getConversation']);
    Route::delete('/{messageId}', [MessageController::class, 'deleteMessage']);
    Route::post('/read/{userId}', [MessageController::class, 'markAsRead']);
});

// Upload routes
Route::prefix('upload')->middleware('auth.jwt')->group(function () {
    Route::post('/avatar', [UploadController::class, 'uploadAvatar']);
    Route::delete('/avatar', [UploadController::class, 'removeAvatar']);
});

// Health check
Route::get('/health', function () {
    return response()->json(['message' => 'Server is working!']);
});
