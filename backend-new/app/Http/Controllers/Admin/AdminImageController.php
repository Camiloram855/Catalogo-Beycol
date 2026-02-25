<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminImageController extends Controller
{
    public function index()
    {
        $images = ProductImage::with('product:id,name')
            ->latest()
            ->get()
            ->map(function ($img) {
                return [
                    'id'           => $img->id,
                    'path'         => $img->path,
                    'filename'     => $img->filename,
                    'is_primary'   => $img->is_primary,
                    'product_id'   => $img->product_id,
                    'product_name' => $img->product?->name,
                ];
            });

        return response()->json(['data' => $images]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'images'   => 'required|array',
            'images.*' => 'image|max:5120',
        ]);

        $uploaded = [];
        foreach ($request->file('images') as $file) {
            $path     = $file->store('misc', 'public');
            $uploaded[] = ProductImage::create([
                'path'     => $path,
                'filename' => $file->getClientOriginalName(),
            ]);
        }

        return response()->json(['data' => $uploaded], 201);
    }

    public function destroy(int $id)
    {
        $image = ProductImage::findOrFail($id);
        Storage::disk('public')->delete($image->path);
        $image->delete();

        return response()->json(['message' => 'Imagen eliminada']);
    }
}
