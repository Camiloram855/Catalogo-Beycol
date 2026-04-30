<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteText;
use Cloudinary\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SiteTextController extends Controller
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

        if (!$this->hasCloudinaryConfig()) {
            return response()->json([
                'message' => 'Cloudinary no está configurado en el servidor.',
            ], 500);
        }

        $current = SiteText::where('key', 'hero_background_image')->first();
        $currentValue = (string) ($current?->value ?? '');
        $currentPublicId = (string) (SiteText::where('key', 'hero_background_public_id')->value('value') ?? '');

        if ($currentPublicId !== '') {
            $this->cloudinary()->uploadApi()->destroy($currentPublicId);
        }

        if (str_starts_with($currentValue, '/storage/')) {
            $oldPath = ltrim(substr($currentValue, strlen('/storage/')), '/');
            if ($oldPath !== '') {
                Storage::disk('public')->delete($oldPath);
            }
        }

        $result = $this->cloudinary()->uploadApi()->upload(
            $request->file('image')->getRealPath(),
            ['folder' => 'site/hero']
        );

        $url = $result['secure_url'];
        $publicId = $result['public_id'];

        SiteText::updateOrCreate(
            ['key' => 'hero_background_image'],
            ['value' => $url]
        );

        SiteText::updateOrCreate(
            ['key' => 'hero_background_public_id'],
            ['value' => $publicId]
        );

        return response()->json([
            'data' => ['url' => $url],
            'message' => 'Portada del hero actualizada.',
        ]);
    }

    public function uploadPromoCard(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:8192|mimes:jpg,jpeg,png,webp',
        ]);

        if (!$this->hasCloudinaryConfig()) {
            return response()->json([
                'message' => 'Cloudinary no está configurado en el servidor.',
            ], 500);
        }

        $currentPublicId = (string) (SiteText::where('key', 'promo_card_public_id')->value('value') ?? '');
        if ($currentPublicId !== '') {
            $this->cloudinary()->uploadApi()->destroy($currentPublicId);
        }

        $result = $this->cloudinary()->uploadApi()->upload(
            $request->file('image')->getRealPath(),
            ['folder' => 'site/promo-card']
        );

        $url = $result['secure_url'];
        $publicId = $result['public_id'];

        SiteText::updateOrCreate(
            ['key' => 'promo_card_image'],
            ['value' => $url]
        );

        SiteText::updateOrCreate(
            ['key' => 'promo_card_public_id'],
            ['value' => $publicId]
        );

        SiteText::updateOrCreate(
            ['key' => 'promo_card_enabled'],
            ['value' => '1']
        );

        return response()->json([
            'data' => ['url' => $url],
            'message' => 'Tarjeta promocional actualizada.',
        ]);
    }
}
