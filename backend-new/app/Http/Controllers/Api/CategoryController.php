<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::orderBy('sort_order')->orderBy('name')->get();

        return response()->json(['data' => $categories]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:categories,name',
            'description' => 'nullable|string',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $category = Category::create($validated);

        return response()->json(['data' => $category, 'message' => 'Categoría creada.'], 201);
    }

    public function show(Category $category)
    {
        return response()->json(['data' => $category]);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100|unique:categories,name,' . $category->id,
            'description' => 'nullable|string',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $category->update($validated);

        return response()->json(['data' => $category->fresh(), 'message' => 'Categoría actualizada.']);
    }

    public function destroy(Category $category)
    {
        // Unlink products from this category
        $category->products()->update(['category_id' => null]);
        $category->delete();

        return response()->json(['message' => 'Categoría eliminada.']);
    }
}
