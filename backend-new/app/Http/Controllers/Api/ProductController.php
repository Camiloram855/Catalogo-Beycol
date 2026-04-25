<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Cloudinary\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
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
                'api_key' => env('CLOUDINARY_API_KEY'),
                'api_secret' => env('CLOUDINARY_API_SECRET'),
            ],
        ]);
    }

    private function uploadImageFile(Product $product, $file): array
    {
        if ($this->hasCloudinaryConfig()) {
            $result = $this->cloudinary()->uploadApi()->upload(
                $file->getRealPath(),
                ['folder' => "products/{$product->id}"]
            );

            return [
                'path' => $result['public_id'],
                'url' => $result['secure_url'],
            ];
        }

        $path = $file->store("products/{$product->id}", 'public');

        return [
            'path' => $path,
            'url' => '/storage/' . ltrim($path, '/'),
        ];
    }

    private function deleteImageFile(ProductImage $image): void
    {
        if ($this->hasCloudinaryConfig() && str_contains((string) $image->url, 'res.cloudinary.com')) {
            $this->cloudinary()->uploadApi()->destroy($image->path);
            return;
        }

        Storage::disk('public')->delete($image->path);
    }

    private function setPrimaryImage(Product $product, ?int $primaryImageId = null): void
    {
        $images = $product->images()->orderBy('sort_order')->get();

        if ($images->isEmpty()) {
            return;
        }

        $fallbackId = $images->first()->id;
        $primaryId = $primaryImageId && $images->contains('id', $primaryImageId)
            ? $primaryImageId
            : $fallbackId;

        $product->images()->update(['is_primary' => false]);
        $product->images()->where('id', $primaryId)->update(['is_primary' => true]);
    }

    private function syncProductImages(Product $product, Request $request): void
    {
        $keepImageIds = collect($request->input('keep_image_ids', []))
            ->map(fn ($id) => (int) $id)
            ->filter()
            ->values();

        if ($request->has('keep_image_ids')) {
            $toDelete = $product->images()->whereNotIn('id', $keepImageIds)->get();
            foreach ($toDelete as $image) {
                $this->deleteImageFile($image);
                $image->delete();
            }
        }

        $newImages = $request->file('images', []);
        $createdIds = [];

        foreach ($newImages as $file) {
            $uploaded = $this->uploadImageFile($product, $file);
            $created = ProductImage::create([
                'product_id' => $product->id,
                'path' => $uploaded['path'],
                'url' => $uploaded['url'],
                'filename' => $file->getClientOriginalName(),
                'is_primary' => false,
                'sort_order' => $product->images()->count(),
            ]);

            $createdIds[] = $created->id;
        }

        $primaryImageId = null;

        if ($request->filled('primary_image_id')) {
            $primaryImageId = (int) $request->input('primary_image_id');
        } elseif ($request->filled('primary_image_index') && count($createdIds) > 0) {
            $index = max(0, (int) $request->input('primary_image_index'));
            $primaryImageId = $createdIds[$index] ?? $createdIds[0];
        }

        $this->setPrimaryImage($product, $primaryImageId);
    }

    /**
     * Public listing - only active products.
     */
    public function indexPublic(Request $request)
    {
        $query = Product::with(['category', 'images'])
            ->active()
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                  ->orWhere('description', 'like', $search);
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        $perPage = min((int) $request->get('per_page', 12), 50);

        return response()->json($query->paginate($perPage));
    }

    /**
     * Public single product.
     */
    public function showPublic(Product $product)
    {
        if (!$product->is_active) {
            return response()->json(['message' => 'Producto no encontrado.'], 404);
        }

        return response()->json(['data' => $product->load(['category', 'images'])]);
    }

    /**
     * Admin listing - all products.
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'images'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                  ->orWhere('sku', 'like', $search);
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        $perPage = min((int) $request->get('per_page', 15), 100);

        return response()->json($query->paginate($perPage));
    }

    /**
     * Admin create product.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|max:100|unique:products,sku',
            'stock' => 'nullable|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'images' => 'nullable|array',
            'images.*' => 'image|max:5120|mimes:jpg,jpeg,png,webp,gif',
            'primary_image_index' => 'nullable|integer|min:0',
        ]);

        $product = Product::create($validated);
        $this->syncProductImages($product, $request);

        return response()->json([
            'data' => $product->fresh(['category', 'images']),
            'message' => 'Producto creado exitosamente.',
        ], 201);
    }

    /**
     * Admin show product.
     */
    public function show(Product $product)
    {
        return response()->json(['data' => $product->load(['category', 'images'])]);
    }

    /**
     * Admin update product.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|max:100|unique:products,sku,' . $product->id,
            'stock' => 'nullable|integer|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'images' => 'nullable|array',
            'images.*' => 'image|max:5120|mimes:jpg,jpeg,png,webp,gif',
            'keep_image_ids' => 'nullable|array',
            'keep_image_ids.*' => 'integer',
            'primary_image_id' => 'nullable|integer',
            'primary_image_index' => 'nullable|integer|min:0',
        ]);

        $product->update($validated);
        $this->syncProductImages($product, $request);

        return response()->json([
            'data' => $product->fresh(['category', 'images']),
            'message' => 'Producto actualizado.',
        ]);
    }

    /**
     * Admin delete product.
     */
    public function destroy(Product $product)
    {
        foreach ($product->images as $image) {
            $this->deleteImageFile($image);
            $image->delete();
        }

        $product->delete();

        return response()->json(['message' => 'Producto eliminado.']);
    }
}
