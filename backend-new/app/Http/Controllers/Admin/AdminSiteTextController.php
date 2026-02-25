<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteText;
use Illuminate\Http\Request;

class AdminSiteTextController extends Controller
{
    public function update(Request $request, string $key)
    {
        $request->validate(['value' => 'required|string']);

        $text = SiteText::firstOrCreate(
            ['key' => $key],
            ['group' => explode('.', $key)[0] ?? 'general']
        );

        $text->update(['value' => $request->value]);

        return response()->json(['data' => $text]);
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'texts'         => 'required|array',
            'texts.*.key'   => 'required|string',
            'texts.*.value' => 'required|string',
        ]);

        foreach ($request->texts as $item) {
            SiteText::updateOrCreate(
                ['key' => $item['key']],
                [
                    'value' => $item['value'],
                    'group' => explode('.', $item['key'])[0] ?? 'general',
                ]
            );
        }

        return response()->json(['message' => 'Textos actualizados']);
    }
}
