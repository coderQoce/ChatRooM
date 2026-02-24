<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FriendRequest extends Model
{
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'status',
        'sender_name',
        'receiver_name',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function toApiArray()
    {
        return [
            'id' => (string) $this->id,
            'senderId' => (string) $this->sender_id,
            'receiverId' => (string) $this->receiver_id,
            'status' => $this->status,
            'senderName' => $this->sender_name,
            'receiverName' => $this->receiver_name,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
