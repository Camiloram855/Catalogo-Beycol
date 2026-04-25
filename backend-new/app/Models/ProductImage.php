<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ProductImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'path',
        'filename',
        'url',
        'is_primary',
        'sort_order',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = ['url'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function getUrlAttribute(): string
    {
        $savedUrl = $this->attributes['url'] ?? null;

        if (!empty($savedUrl)) {
            if (str_starts_with($savedUrl, '/')) {
                return $savedUrl;
            }

            if (preg_match('#^https?://localhost(?::\d+)?/storage/#i', $savedUrl)) {
                $path = parse_url($savedUrl, PHP_URL_PATH) ?: '';
                return $path ?: $savedUrl;
            }

            return $savedUrl;
        }

        if (str_contains((string) $this->path, '/')) {
            return '/storage/' . ltrim((string) $this->path, '/');
        }

        if (filled(env('CLOUDINARY_CLOUD_NAME')) && filled(env('CLOUDINARY_API_KEY')) && filled(env('CLOUDINARY_API_SECRET'))) {
            return cloudinary()->image($this->path)->toUrl();
        }

        return '';
    }
}
