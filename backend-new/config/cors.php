<?php

return [
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => explode(',', env('FRONTEND_URL')),
'allowed_origins_patterns' => [
    '#^https://.*\.vercel\.app$#',
],
'allowed_headers' => ['*'],
'supports_credentials' => false,
];