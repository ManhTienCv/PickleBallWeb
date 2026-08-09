<?php

namespace App\Modules\Shared\Traits;

use Illuminate\Http\JsonResponse;

trait HasStandardResponse
{
    protected function success(mixed $data = null, string $message = 'Success', int $code = 200, array $meta = []): JsonResponse
    {
        $response = [
            'data' => $data,
            'error' => null,
            'message' => $message,
        ];

        if (!empty($meta)) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $code);
    }

    protected function error(string $message = 'Error', int $code = 400, mixed $errors = null): JsonResponse
    {
        return response()->json([
            'data' => null,
            'error' => [
                'message' => $message,
                'details' => $errors,
            ],
            'message' => $message,
        ], $code);
    }

    protected function created(mixed $data = null, string $message = 'Created'): JsonResponse
    {
        return $this->success($data, $message, 201);
    }

    protected function noContent(): JsonResponse
    {
        return response()->json(null, 204);
    }
}
