<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductImageController extends Controller
{
    public function store(Request $request, Product $product)
    {
        $request->validate([
            'image' => 'required|image|max:5120|mimes:jpg,jpeg,png,webp,gif',
        ]);

        $file = $request->file('image');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs("products/{$product->id}", $filename, 'public');

        $isPrimary = $product->images()->count() === 0;

        $image = ProductImage::create([
            'product_id' => $product->id,
            'path' => $path,
            'filename' => $file->getClientOriginalName(),
            'is_primary' => $isPrimary,
            'sort_order' => $product->images()->count(),
        ]);

                return response()->json([
            'data' => [
                'id' => $image->id,
                'url' => asset('storage/' . $image->path), // 👈 ESTA ES LA CLAVE
                'filename' => $image->filename,
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

        Storage::disk('public')->delete($image->path);
        $wasPrimary = $image->is_primary;
        $image->delete();

        // If deleted was primary, assign next image as primary
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

        // Remove primary from all other images
        $product->images()->update(['is_primary' => false]);
        $image->update(['is_primary' => true]);

        return response()->json(['data' => $image, 'message' => 'Imagen principal actualizada.']);
    }
}
