<?php

return [
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => array_values(array_filter(array_map('trim', explode(',', (string) env('FRONTEND_URL', ''))))),
'allowed_origins_patterns' => [
    '#^https://.*\.vercel\.app$#',
    '#^https://.*\.railway\.app$#',
],
'allowed_headers' => ['*'],
'supports_credentials' => false,
];
