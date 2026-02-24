<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\FriendRequest;
use Illuminate\Http\Request;

class FriendController extends Controller
{
    public function getFriends(Request $request)
    {
        try {
            $currentUser = auth('api')->user();
            $friendIds = $currentUser->friends ?? [];

            // Get friends
            $friends = User::whereIn('id', $friendIds)->get()->map(fn($u) => $u->toSafeArray());

            // Get pending requests received
            $pendingRequests = FriendRequest::where('receiver_id', $currentUser->id)
                ->where('status', 'pending')
                ->get()
                ->map(function ($req) {
                    $sender = User::find($req->sender_id);
                    if (!$sender) return null;
                    $data = $req->toApiArray();
                    $data['sender'] = $sender->toSafeArray();
                    return $data;
                })
                ->filter()
                ->values();

            // Get sent requests
            $sentRequests = FriendRequest::where('sender_id', $currentUser->id)
                ->where('status', 'pending')
                ->get()
                ->map(function ($req) {
                    $receiver = User::find($req->receiver_id);
                    if (!$receiver) return null;
                    $data = $req->toApiArray();
                    $data['receiver'] = $receiver->toSafeArray();
                    return $data;
                })
                ->filter()
                ->values();

            return response()->json([
                'success' => true,
                'friends' => $friends,
                'pendingRequests' => $pendingRequests,
                'sentRequests' => $sentRequests,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching friends',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function sendRequest($userId)
    {
        try {
            $currentUser = auth('api')->user();

            if ((string) $userId === (string) $currentUser->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot send friend request to yourself',
                ], 400);
            }

            $targetUser = User::find($userId);
            if (!$targetUser) {
                return response()->json(['success' => false, 'message' => 'User not found'], 404);
            }

            $friends = $currentUser->friends ?? [];
            if (in_array((string) $userId, $friends)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Already friends with this user',
                ], 400);
            }

            $existing = FriendRequest::where(function ($q) use ($currentUser, $userId) {
                $q->where('sender_id', $currentUser->id)->where('receiver_id', $userId);
            })->orWhere(function ($q) use ($currentUser, $userId) {
                $q->where('sender_id', $userId)->where('receiver_id', $currentUser->id);
            })->where('status', 'pending')->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Friend request already sent',
                ], 400);
            }

            $friendRequest = FriendRequest::create([
                'sender_id' => $currentUser->id,
                'receiver_id' => $userId,
                'status' => 'pending',
                'sender_name' => $currentUser->username,
                'receiver_name' => $targetUser->username,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Friend request sent successfully',
                'request' => $friendRequest->toApiArray(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error sending friend request',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function acceptRequest($requestId)
    {
        try {
            $currentUser = auth('api')->user();

            $friendRequest = FriendRequest::where('id', $requestId)
                ->where('receiver_id', $currentUser->id)
                ->where('status', 'pending')
                ->first();

            if (!$friendRequest) {
                return response()->json(['success' => false, 'message' => 'Friend request not found'], 404);
            }

            $friendRequest->update(['status' => 'accepted']);

            $sender = User::find($friendRequest->sender_id);
            $receiver = User::find($friendRequest->receiver_id);

            if ($sender && $receiver) {
                // Add to each other's friend lists
                $senderFriends = $sender->friends ?? [];
                if (!in_array((string) $receiver->id, $senderFriends)) {
                    $senderFriends[] = (string) $receiver->id;
                    $sender->update(['friends' => $senderFriends]);
                }

                $receiverFriends = $receiver->friends ?? [];
                if (!in_array((string) $sender->id, $receiverFriends)) {
                    $receiverFriends[] = (string) $sender->id;
                    $receiver->update(['friends' => $receiverFriends]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Friend request accepted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error accepting friend request',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function rejectRequest($requestId)
    {
        try {
            $currentUser = auth('api')->user();

            $friendRequest = FriendRequest::where('id', $requestId)
                ->where('receiver_id', $currentUser->id)
                ->where('status', 'pending')
                ->first();

            if (!$friendRequest) {
                return response()->json(['success' => false, 'message' => 'Friend request not found'], 404);
            }

            $friendRequest->update(['status' => 'rejected']);

            return response()->json([
                'success' => true,
                'message' => 'Friend request rejected successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error rejecting friend request',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function removeFriend($userId)
    {
        try {
            $currentUser = auth('api')->user();

            // Remove from current user's friends
            $currentFriends = $currentUser->friends ?? [];
            $currentFriends = array_values(array_filter($currentFriends, fn($id) => $id !== (string) $userId));
            $currentUser->update(['friends' => $currentFriends]);

            // Remove from other user's friends
            $otherUser = User::find($userId);
            if ($otherUser) {
                $otherFriends = $otherUser->friends ?? [];
                $otherFriends = array_values(array_filter($otherFriends, fn($id) => $id !== (string) $currentUser->id));
                $otherUser->update(['friends' => $otherFriends]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Friend removed successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error removing friend',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function addFriend($userId)
    {
        try {
            $currentUser = auth('api')->user();

            if ((string) $userId === (string) $currentUser->id) {
                return response()->json(['success' => false, 'message' => 'You cannot add yourself'], 400);
            }

            $otherUser = User::find($userId);
            if (!$otherUser) {
                return response()->json(['success' => false, 'message' => 'User not found'], 404);
            }

            $currentFriends = $currentUser->friends ?? [];
            if (in_array((string) $userId, $currentFriends)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Already friends with this user',
                ], 400);
            }

            $currentFriends[] = (string) $userId;
            $currentUser->update(['friends' => $currentFriends]);

            $otherFriends = $otherUser->friends ?? [];
            if (!in_array((string) $currentUser->id, $otherFriends)) {
                $otherFriends[] = (string) $currentUser->id;
                $otherUser->update(['friends' => $otherFriends]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Friend added successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error adding friend',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
