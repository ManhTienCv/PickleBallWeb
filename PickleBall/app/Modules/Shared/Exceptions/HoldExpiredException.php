<?php

namespace App\Modules\Shared\Exceptions;

class HoldExpiredException extends ApiException
{
    public function __construct(string $message = 'Hold has expired', mixed $errors = null)
    {
        parent::__construct($message, 409, $errors);
    }
}
