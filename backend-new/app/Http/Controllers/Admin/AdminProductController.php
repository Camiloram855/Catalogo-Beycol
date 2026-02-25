<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    public function show(int $id)
    {
        $product = Product::with(['category', 'images'])->findOrFail($id);
        return response()->json(['data' => $product]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'slug'              => 'nullable|string|max:255|unique:products,slug',
            'short_description' => 'nullable|string|max:500',
            'description'       => 'nullable|string',
            'price'             => 'nullable|numeric|min:0',
            'category_id'       => 'nullable|exists:categories,id',
            'is_featured'       => 'boolean',
            'is_active'         => 'boolean',
            'tags'              => 'nullable|string',
            'images.*'          => 'nullable|image|max:5120',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        $validated['tags'] = $this->parseTags($request->tags);

        $product = Product::create($validated);

        $this->handleImages($request, $product);

        return response()->json(['data' => $product->load(['category', 'images'])], 201);
    }

    public function update(Request $request, int $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'slug'              => 'nullable|string|max:255|unique:products,slug,' . $id,
            'short_description' => 'nullable|string|max:500',
            'description'       => 'nullable|string',
            'price'             => 'nullable|numeric|min:0',
            'category_id'       => 'nullable|exists:categories,id',
            'is_featured'       => 'boolean',
            'is_active'         => 'boolean',
            'tags'              => 'nullable|string',
            'images.*'          => 'nullable|image|max:5120',
            'keep_image_ids'    => 'nullable|array',
            'keep_image_ids.*'  => 'integer',
            'primary_image_id'  => 'nullable|integer|exists:product_images,id',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        $validated['tags'] = $this->parseTags($request->tags);

        $product->update($validated);

        // Delete images not in keep list
        if ($request->has('keep_image_ids')) {
            $toDelete = $product->images()->whereNotIn('id', $request->keep_image_ids)->get();
            foreach ($toDelete as $img) {
                Storage::disk('public')->delete($img->path);
                $img->delete();
            }
        }

        // Handle primary image
        if ($request->filled('primary_image_id')) {
            $product->images()->update(['is_primary' => false]);
            ProductImage::where('id', $request->primary_image_id)
                ->where('product_id', $product->id)
                ->update(['is_primary' => true]);
        }

        $this->handleImages($request, $product);

        return response()->json(['data' => $product->load(['category', 'images'])]);
    }

    public function destroy(int $id)
    {
        $product = Product::findOrFail($id);

        foreach ($product->images as $img) {
            Storage::disk('public')->delete($img->path);
        }

        $product->delete();

        return response()->json(['message' => 'Producto eliminado']);
    }

    public function toggleFeatured(int $id)
    {
        $product = Product::findOrFail($id);
        $product->update(['is_featured' => ! $product->is_featured]);

        return response()->json(['data' => $product]);
    }

    private function handleImages(Request $request, Product $product): void
    {
        if (! $request->hasFile('images')) return;

        $isFirst = $product->images()->count() === 0;

        foreach ($request->file('images') as $i => $file) {
            $path = $file->store('products', 'public');
            $img  = $product->images()->create([
                'path'       => $path,
                'filename'   => $file->getClientOriginalName(),
                'is_primary' => $isFirst && $i === 0,
                'sort_order' => $product->images()->count() + $i,
            ]);
        }
    }

    private function parseTags(?string $tags): array
    {
        if (! $tags) return [];
        return array_values(array_filter(array_map('trim', explode(',', $tags))));
    }
}
