<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pedido;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
}
