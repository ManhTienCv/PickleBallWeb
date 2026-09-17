<?php

namespace App\Modules\Shared\Exceptions;

use Exception;

class ApiException extends Exception
{
    protected mixed $errors;

    public function __construct(string $message = 'An error occurred', int $code = 400, mixed $errors = null)
    {
        parent::__construct($message, $code);
        $this->errors = $errors;
    }

    public function getErrors(): mixed
    {
        return $this->errors;
    }

    public function render($request): \Illuminate\Http\JsonResponse
    {
        $code = ($this->getCode() >= 400 && $this->getCode() < 600) ? $this->getCode() : 400;

        return response()->json([
            'data' => null,
            'error' => [
                'message' => $this->getMessage(),
                'details' => $this->errors,
            ],
            'message' => $this->getMessage(),
        ], $code);
    }
}
