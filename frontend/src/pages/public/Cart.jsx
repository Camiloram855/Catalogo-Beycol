import { Link, useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { formatCurrency } from '../../utils/checkout'
import { resolveMediaUrl } from '../../utils/media'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, totalPrice, updateQuantity, removeItem } = useCart()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-4xl text-gray-900 mb-8">Carrito de compras</h1>

      {items.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-gray-500 mb-4">Tu carrito esta vacio.</p>
          <Link to="/catalogo" className="btn-primary">Ir al catalogo</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-5 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                  {item.imagen ? (
                    <img
                      src={resolveMediaUrl(item.imagen)}
                      alt={item.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                      IMG
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-gray-900 font-medium">{item.nombre}</h3>
                  <p className="text-sm text-gray-500">{formatCurrency(item.precio)} c/u</p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                    className="input-field w-24"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    aria-label={`Eliminar ${item.nombre}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="text-right min-w-[120px]">
                  <p className="text-sm text-gray-500">Subtotal</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(item.precio * item.cantidad)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <aside className="card p-5 h-fit">
            <p className="text-sm text-gray-500 mb-2">Total</p>
            <p className="text-2xl font-semibold text-gray-900 mb-5">{formatCurrency(totalPrice)}</p>
            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full justify-center"
            >
              Finalizar compra
            </button>
          </aside>
        </div>
      )}
    </div>
  )
}
