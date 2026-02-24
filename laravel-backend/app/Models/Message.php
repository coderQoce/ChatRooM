<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'content',
        'read',
        'read_at',
        'deleted_for',
    ];

    protected function casts(): array
    {
        return [
            'read' => 'boolean',
            'read_at' => 'datetime',
            'deleted_for' => 'array',
        ];
    }

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
            'content' => $this->content,
            'read' => $this->read,
            'readAt' => $this->read_at?->toISOString(),
            'deletedFor' => $this->deleted_for ?? [],
            'createdAt' => $this->created_at?->toISOString(),
            'sender' => $this->sender ? $this->sender->toSafeArray() : null,
            'receiver' => $this->receiver ? $this->receiver->toSafeArray() : null,
        ];
    }
}
