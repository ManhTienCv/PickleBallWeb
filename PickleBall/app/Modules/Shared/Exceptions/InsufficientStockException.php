<?php

namespace App\Modules\Shared\Exceptions;

class InsufficientStockException extends ApiException
{
    public function __construct(string $message = 'Insufficient stock', mixed $errors = null)
    {
        parent::__construct($message, 409, $errors);
    }
}
