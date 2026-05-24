<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class PedidoController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'cliente' => 'required|array',
            'cliente.nombre' => 'required|string|max:120',
            'cliente.apellido' => 'required|string|max:120',
            'cliente.telefono' => 'required|string|max:40',
            'cliente.correo' => 'required|email|max:180',
            'cliente.direccion' => 'required|string|max:255',
            'cliente.ciudad' => 'required|string|max:150',
            'cliente.comentarios' => 'nullable|string|max:2000',
            'productos' => 'required|array|min:1',
            'productos.*.id' => 'required|integer',
            'productos.*.nombre' => 'required|string|max:255',
            'productos.*.precio' => 'required|numeric|min:0',
            'productos.*.cantidad' => 'required|integer|min:1',
            'meta_event_id' => 'nullable|string|max:100',
        ]);

        try {
            $pedido = DB::transaction(function () use ($validated) {
                $total = 0;
                $detalles = [];

                foreach ($validated['productos'] as $producto) {
                    $precio = round((float) $producto['precio'], 2);
                    $cantidad = (int) $producto['cantidad'];
                    $subtotal = round($precio * $cantidad, 2);

                    $total += $subtotal;
                    $detalles[] = [
                        'producto_id' => $producto['id'],
                        'nombre_producto' => $producto['nombre'],
                        'precio' => $precio,
                        'cantidad' => $cantidad,
                        'subtotal' => $subtotal,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }

                $cliente = $validated['cliente'];

                $pedido = Pedido::create([
                    'nombre' => $cliente['nombre'],
                    'apellido' => $cliente['apellido'],
                    'telefono' => $cliente['telefono'],
                    'correo' => $cliente['correo'],
                    'direccion' => $cliente['direccion'],
                    'ciudad' => $cliente['ciudad'],
                    'comentarios' => $cliente['comentarios'] ?? null,
                    'total' => round($total, 2),
                ]);

                $pedido->detalles()->createMany($detalles);

                return $pedido->load('detalles');
            });

            $this->sendMetaPurchaseEvent($request, $validated, $pedido);

            return response()->json([
                'message' => 'Pedido creado correctamente.',
                'data' => [
                    'id' => $pedido->id,
                    'total' => (float) $pedido->total,
                    'created_at' => $pedido->created_at,
                    'detalles' => $pedido->detalles,
                ],
            ], 201);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'No se pudo procesar el pedido.',
            ], 500);
        }
    }

    private function sendMetaPurchaseEvent(Request $request, array $validated, Pedido $pedido): void
    {
        $pixelId = config('services.meta.pixel_id');
        $accessToken = config('services.meta.access_token');

        if (!$pixelId || !$accessToken) {
            return;
        }

        $cliente = $validated['cliente'];
        $eventId = $validated['meta_event_id'] ?? null;
        $eventTime = now()->timestamp;

        $userData = array_filter([
            'em' => $this->hashValue($cliente['correo'] ?? null),
            'ph' => $this->hashValue($cliente['telefono'] ?? null),
            'fn' => $this->hashValue($cliente['nombre'] ?? null),
            'ln' => $this->hashValue($cliente['apellido'] ?? null),
            'ct' => $this->hashValue($cliente['ciudad'] ?? null),
            'country' => $this->hashValue('co'),
            'client_ip_address' => $request->ip(),
            'client_user_agent' => $request->userAgent(),
        ]);

        $customData = [
            'currency' => 'COP',
            'value' => (float) $pedido->total,
            'content_type' => 'product',
            'content_ids' => collect($validated['productos'])->map(fn ($producto) => (string) $producto['id'])->values()->all(),
            'num_items' => collect($validated['productos'])->sum(fn ($producto) => (int) $producto['cantidad']),
        ];

        $payload = [
            'data' => [[
                'event_name' => 'Purchase',
                'event_time' => $eventTime,
                'action_source' => 'website',
                'event_source_url' => $request->headers->get('origin'),
                'event_id' => $eventId,
                'user_data' => $userData,
                'custom_data' => $customData,
            ]],
        ];

        $testEventCode = config('services.meta.test_event_code');
        if ($testEventCode) {
            $payload['test_event_code'] = $testEventCode;
        }

        try {
            Http::timeout(8)->post(
                "https://graph.facebook.com/v23.0/{$pixelId}/events",
                array_merge($payload, ['access_token' => $accessToken])
            )->throw();
        } catch (Throwable $exception) {
            Log::warning('Meta Conversion API request failed', [
                'pedido_id' => $pedido->id,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function hashValue(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        return hash('sha256', mb_strtolower(trim($value)));
    }
}
