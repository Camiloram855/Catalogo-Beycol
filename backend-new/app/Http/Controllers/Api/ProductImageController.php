<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Cloudinary\Cloudinary;
use Illuminate\Support\Facades\Storage;

class ProductImageController extends Controller
{
    private function hasCloudinaryConfig(): bool
    {
        return filled(env('CLOUDINARY_CLOUD_NAME'))
            && filled(env('CLOUDINARY_API_KEY'))
            && filled(env('CLOUDINARY_API_SECRET'));
    }

    private function cloudinary(): Cloudinary
    {
        return new Cloudinary([
            'cloud' => [
                'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                'api_key'    => env('CLOUDINARY_API_KEY'),
                'api_secret' => env('CLOUDINARY_API_SECRET'),
            ],
        ]);
    }

    public function store(Request $request, Product $product)
    {
        $request->validate([
            'image' => 'required|image|max:5120|mimes:jpg,jpeg,png,webp,gif',
        ]);

        if ($this->hasCloudinaryConfig()) {
            $result = $this->cloudinary()->uploadApi()->upload(
                $request->file('image')->getRealPath(),
                ['folder' => "products/{$product->id}"]
            );

            $path = $result['public_id'];
            $url = $result['secure_url'];
        } else {
            $path = $request->file('image')->store("products/{$product->id}", 'public');
            $url = '/storage/' . ltrim($path, '/');
        }

        $isPrimary = $product->images()->count() === 0;

        $image = ProductImage::create([
            'product_id' => $product->id,
            'path'       => $path,
            'filename'   => $request->file('image')->getClientOriginalName(),
            'url'        => $url,
            'is_primary' => $isPrimary,
            'sort_order' => $product->images()->count(),
        ]);

        return response()->json([
            'data' => [
                'id'         => $image->id,
                'url'        => $image->url,
                'filename'   => $image->filename,
                'is_primary' => $image->is_primary,
            ],
            'message' => 'Imagen subida correctamente.'
        ], 201);
    }

    public function destroy(Product $product, ProductImage $image)
    {
        if ($image->product_id !== $product->id) {
            return response()->json(['message' => 'Imagen no pertenece a este producto.'], 403);
        }

        if ($this->hasCloudinaryConfig() && str_contains((string) $image->url, 'res.cloudinary.com')) {
            $this->cloudinary()->uploadApi()->destroy($image->path);
        } else {
            Storage::disk('public')->delete($image->path);
        }

        $wasPrimary = $image->is_primary;
        $image->delete();

        if ($wasPrimary) {
            $next = $product->images()->first();
            $next?->update(['is_primary' => true]);
        }

        return response()->json(['message' => 'Imagen eliminada.']);
    }

    public function setPrimary(Product $product, ProductImage $image)
    {
        if ($image->product_id !== $product->id) {
            return response()->json(['message' => 'Imagen no pertenece a este producto.'], 403);
        }

        $product->images()->update(['is_primary' => false]);
        $image->update(['is_primary' => true]);

        return response()->json(['data' => $image, 'message' => 'Imagen principal actualizada.']);
    }
}
