<?php

$allowedOrigins = array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', ''))));
if (empty($allowedOrigins)) {
    $allowedOrigins = [
        env('FRONTEND_URL', 'http://localhost:5173'),
        env('ADMIN_URL', 'http://localhost:5174'),
    ];
}

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => $allowedOrigins,
    'allowed_origins_patterns' => [
        '#^https://.*\.vercel\.app$#',
        '#^https://.*\.onrender\.com$#',
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => ['X-Trace-Id'],
    'max_age' => 0,
    'supports_credentials' => true,
];
