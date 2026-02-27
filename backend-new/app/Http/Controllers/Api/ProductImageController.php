<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Cloudinary\Cloudinary;

class ProductImageController extends Controller
{
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

        $result = $this->cloudinary()->uploadApi()->upload(
            $request->file('image')->getRealPath(),
            ['folder' => "products/{$product->id}"]
        );

        $isPrimary = $product->images()->count() === 0;

        $image = ProductImage::create([
            'product_id' => $product->id,
            'path'       => $result['public_id'],
            'filename'   => $request->file('image')->getClientOriginalName(),
            'url'        => $result['secure_url'],
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

        $this->cloudinary()->uploadApi()->destroy($image->path);

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