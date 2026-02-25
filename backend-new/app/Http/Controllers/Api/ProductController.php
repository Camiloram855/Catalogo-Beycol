<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Public listing — only active products.
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
     * Admin listing — all products.
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
        ]);

        $product = Product::create($validated);

        return response()->json([
            'data' => $product->load(['category', 'images']),
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
        ]);

        $product->update($validated);

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
        // Delete associated images from storage
        foreach ($product->images as $image) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($image->path);
            $image->delete();
        }

        $product->delete();

        return response()->json(['message' => 'Producto eliminado.']);
    }
}
