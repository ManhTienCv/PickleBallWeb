<?php

namespace App\Modules\Shared\Exceptions;

class PaymentFailedException extends ApiException
{
    public function __construct(string $message = 'Payment failed', mixed $errors = null)
    {
        parent::__construct($message, 402, $errors);
    }
}
