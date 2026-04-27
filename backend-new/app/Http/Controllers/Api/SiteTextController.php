<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteText;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SiteTextController extends Controller
{
    public function index()
    {
        $texts = SiteText::orderBy('key')->get();

        return response()->json($texts);
    }

    public function update(Request $request, string $key)
    {
        $request->validate([
            'value' => 'nullable|string',
        ]);

        $text = SiteText::updateOrCreate(
            ['key' => $key],
            ['value' => $request->value]
        );

        return response()->json(['data' => $text, 'message' => 'Texto actualizado.']);
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'texts' => 'required|array',
        ]);

        foreach ($request->texts as $key => $value) {
            SiteText::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        $texts = SiteText::orderBy('key')->get();

        return response()->json(['data' => $texts, 'message' => 'Textos actualizados.']);
    }

    public function uploadHeroBackground(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:6144|mimes:jpg,jpeg,png,webp',
        ]);

        $current = SiteText::where('key', 'hero_background_image')->first();
        $currentValue = (string) ($current?->value ?? '');

        if (str_starts_with($currentValue, '/storage/')) {
            $oldPath = ltrim(substr($currentValue, strlen('/storage/')), '/');
            if ($oldPath !== '') {
                Storage::disk('public')->delete($oldPath);
            }
        }

        $path = $request->file('image')->store('site/hero', 'public');
        $url = '/storage/' . ltrim($path, '/');

        SiteText::updateOrCreate(
            ['key' => 'hero_background_image'],
            ['value' => $url]
        );

        return response()->json([
            'data' => ['url' => $url],
            'message' => 'Portada del hero actualizada.',
        ]);
    }
}
