<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteText;
use Illuminate\Http\Request;

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
}
