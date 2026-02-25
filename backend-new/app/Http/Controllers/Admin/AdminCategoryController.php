<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminCategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('products')->orderBy('sort_order')->get();
        return response()->json(['data' => $categories]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'slug'        => 'nullable|string|max:100|unique:categories,slug',
            'description' => 'nullable|string|max:500',
            'color'       => 'nullable|string|max:20',
            'sort_order'  => 'nullable|integer',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);

        $category = Category::create($validated);

        return response()->json(['data' => $category], 201);
    }

    public function update(Request $request, int $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name'        => 'required|string|max:100',
            'slug'        => 'nullable|string|max:100|unique:categories,slug,' . $id,
            'description' => 'nullable|string|max:500',
            'color'       => 'nullable|string|max:20',
            'sort_order'  => 'nullable|integer',
            'is_active'   => 'boolean',
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        $category->update($validated);

        return response()->json(['data' => $category]);
    }

    public function destroy(int $id)
    {
        $category = Category::findOrFail($id);

        if ($category->products()->count() > 0) {
            $category->products()->update(['category_id' => null]);
        }

        $category->delete();

        return response()->json(['message' => 'Categoría eliminada']);
    }
}
