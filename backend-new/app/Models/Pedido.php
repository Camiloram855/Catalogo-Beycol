<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedido extends Model
{
    use HasFactory;

    protected $table = 'pedidos';

    protected $fillable = [
        'nombre',
        'apellido',
        'telefono',
        'correo',
        'direccion',
        'ciudad',
        'comentarios',
        'total',
    ];

    protected $casts = [
        'total' => 'decimal:2',
    ];

    public function detalles()
    {
        return $this->hasMany(DetallePedido::class, 'pedido_id');
    }
}
