<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => explode(',', env('FRONTEND_URL', 'https://beycol-catalogo.vercel.app')),
    'allowed_origins_patterns' => [
        '#^https://beycol-catalogo.*\.vercel\.app$#',
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];