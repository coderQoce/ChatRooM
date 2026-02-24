<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function getChats(Request $request)
    {
        try {
            $currentUserId = auth('api')->id();
            $currentUser = auth('api')->user();
            $friendIds = $currentUser->friends ?? [];

            $messages = Message::where(function ($q) use ($currentUserId) {
                $q->where('sender_id', $currentUserId)
                  ->orWhere('receiver_id', $currentUserId);
            })->orderBy('created_at', 'desc')->get();

            $latestByUser = [];

            foreach ($messages as $m) {
                $deletedFor = $m->deleted_for ?? [];
                if (in_array((string) $currentUserId, $deletedFor)) continue;

                $otherUserId = (string) ($m->sender_id == $currentUserId ? $m->receiver_id : $m->sender_id);
                if (!in_array($otherUserId, $friendIds)) continue;

                if (!isset($latestByUser[$otherUserId])) {
                    $latestByUser[$otherUserId] = $m;
                }
            }

            $chats = [];
            foreach ($latestByUser as $otherUserId => $lastMessage) {
                $otherUser = User::find($otherUserId);
                if (!$otherUser) continue;

                $lastMessage->load(['sender', 'receiver']);

                $chats[] = [
                    'user' => $otherUser->toSafeArray(),
                    'lastMessage' => $lastMessage->toApiArray(),
                ];
            }

            // Sort by latest message
            usort($chats, function ($a, $b) {
                return strtotime($b['lastMessage']['createdAt']) - strtotime($a['lastMessage']['createdAt']);
            });

            return response()->json([
                'success' => true,
                'chats' => $chats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching chats',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function sendMessage(Request $request)
    {
        try {
            $request->validate([
                'receiverId' => 'required',
                'content' => 'required|string',
            ]);

            $senderId = auth('api')->id();
            $receiverId = $request->input('receiverId');

            $receiver = User::find($receiverId);
            if (!$receiver) {
                return response()->json(['success' => false, 'message' => 'Receiver not found'], 404);
            }

            $sender = auth('api')->user();
            $friends = $sender->friends ?? [];
            if (!in_array((string) $receiverId, $friends)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only send messages to friends',
                ], 403);
            }

            $message = Message::create([
                'sender_id' => $senderId,
                'receiver_id' => $receiverId,
                'content' => $request->input('content'),
                'read' => false,
                'read_at' => null,
                'deleted_for' => [],
            ]);

            $message->load(['sender', 'receiver']);

            return response()->json([
                'success' => true,
                'message' => $message->toApiArray(),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'receiverId and content are required',
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error sending message',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getConversation($userId)
    {
        try {
            $currentUserId = auth('api')->id();
            $currentUser = auth('api')->user();

            $friends = $currentUser->friends ?? [];
            if (!in_array((string) $userId, $friends)) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only view messages with friends',
                ], 403);
            }

            $messages = Message::where(function ($q) use ($currentUserId, $userId) {
                $q->where(function ($q2) use ($currentUserId, $userId) {
                    $q2->where('sender_id', $currentUserId)->where('receiver_id', $userId);
                })->orWhere(function ($q2) use ($currentUserId, $userId) {
                    $q2->where('sender_id', $userId)->where('receiver_id', $currentUserId);
                });
            })->orderBy('created_at', 'asc')->get();

            // Filter out deleted messages and mark as read
            $conversation = [];
            foreach ($messages as $m) {
                $deletedFor = $m->deleted_for ?? [];
                if (in_array((string) $currentUserId, $deletedFor)) continue;

                // Mark messages from other user as read
                if ($m->sender_id == $userId && $m->receiver_id == $currentUserId && !$m->read) {
                    $m->update(['read' => true, 'read_at' => now()]);
                }

                $m->load(['sender', 'receiver']);
                $conversation[] = $m->toApiArray();
            }

            return response()->json([
                'success' => true,
                'messages' => $conversation,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching conversation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function deleteMessage($messageId)
    {
        try {
            $userId = auth('api')->id();
            $message = Message::find($messageId);

            if (!$message) {
                return response()->json(['success' => false, 'message' => 'Message not found'], 404);
            }

            if ($message->sender_id != $userId && $message->receiver_id != $userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only delete messages from your conversations',
                ], 403);
            }

            $deletedFor = $message->deleted_for ?? [];
            if (!in_array((string) $userId, $deletedFor)) {
                $deletedFor[] = (string) $userId;
                $message->update(['deleted_for' => $deletedFor]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Message deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting message',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function markAsRead($userId)
    {
        try {
            $currentUserId = auth('api')->id();

            Message::where('sender_id', $userId)
                ->where('receiver_id', $currentUserId)
                ->where('read', false)
                ->update(['read' => true, 'read_at' => now()]);

            return response()->json([
                'success' => true,
                'message' => 'Messages marked as read',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error marking messages as read',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
