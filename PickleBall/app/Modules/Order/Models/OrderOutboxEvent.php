<?php

namespace App\Modules\Order\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderOutboxEvent extends Model
{
    use HasFactory;

    protected $connection = 'main';

    protected $fillable = [
        'order_id',
        'event_type',
        'payload',
        'status',
        'retry_count',
        'published_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'retry_count' => 'integer',
        'published_at' => 'datetime',
    ];
}
