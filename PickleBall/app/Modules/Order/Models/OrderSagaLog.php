<?php

namespace App\Modules\Order\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderSagaLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $connection = 'main';

    protected $fillable = [
        'order_id',
        'step_number',
        'step_name',
        'status',
        'request_payload',
        'response_payload',
        'error_message',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'step_number' => 'integer',
        'request_payload' => 'array',
        'response_payload' => 'array',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];
}
