import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCart } from '../../context/CartContext'
import { ordersService } from '../../services/orders'
import { buildWhatsAppMessage, buildWhatsAppUrl, formatCurrency } from '../../utils/checkout'

const initialForm = {
  nombre: '',
  apellido: '',
  telefono: '',
  correo: '',
  direccion: '',
  ciudad: '',
  comentarios: '',
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, totalPrice, clearCart } = useCart()
  const [form, setForm] = useState(initialForm)
  const [sending, setSending] = useState(false)

  const requiredFields = useMemo(
    () => ['nombre', 'apellido', 'telefono', 'correo', 'direccion', 'ciudad'],
    [],
  )

  const missingFields = requiredFields.filter((field) => !form[field]?.trim())

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (items.length === 0) {
      toast.error('El carrito esta vacio.')
      navigate('/catalogo')
      return
    }

    if (missingFields.length > 0) {
      toast.error('Completa todos los campos obligatorios.')
      return
    }

    try {
      setSending(true)

      const payload = {
        cliente: form,
        productos: items.map((item) => ({
          id: item.id,
          nombre: item.nombre,
          precio: item.precio,
          cantidad: item.cantidad,
        })),
      }

      const response = await ordersService.create(payload)
      const orderData = response?.data

      const message = buildWhatsAppMessage({
        cliente: form,
        productos: items,
        total: orderData?.total ?? totalPrice,
        pedidoId: orderData?.id ?? 'N/A',
      })

      const whatsappUrl = buildWhatsAppUrl(message)

      toast.success('Pedido creado. Te redirigimos a WhatsApp.')
      clearCart()
      window.open(whatsappUrl, '_blank')
      navigate('/catalogo')
    } catch (error) {
      const apiMessage = error.response?.data?.message || 'No se pudo crear el pedido.'
      toast.error(apiMessage)
    } finally {
      setSending(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display text-4xl text-gray-900 mb-4">Checkout</h1>
        <div className="card p-8 text-center">
          <p className="text-gray-500 mb-4">No hay productos en el carrito.</p>
          <Link to="/catalogo" className="btn-primary">Ir al catalogo</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-4xl text-gray-900 mb-8">Finalizar compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre *</label>
              <input
                value={form.nombre}
                onChange={(event) => setForm((prev) => ({ ...prev, nombre: event.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Apellido *</label>
              <input
                value={form.apellido}
                onChange={(event) => setForm((prev) => ({ ...prev, apellido: event.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Telefono *</label>
              <input
                value={form.telefono}
                onChange={(event) => setForm((prev) => ({ ...prev, telefono: event.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Correo *</label>
              <input
                type="email"
                value={form.correo}
                onChange={(event) => setForm((prev) => ({ ...prev, correo: event.target.value }))}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Direccion *</label>
            <input
              value={form.direccion}
              onChange={(event) => setForm((prev) => ({ ...prev, direccion: event.target.value }))}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Ciudad / Departamento *</label>
            <input
              value={form.ciudad}
              onChange={(event) => setForm((prev) => ({ ...prev, ciudad: event.target.value }))}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Comentarios</label>
            <textarea
              value={form.comentarios}
              onChange={(event) => setForm((prev) => ({ ...prev, comentarios: event.target.value }))}
              className="input-field min-h-[120px]"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={sending}>
            {sending ? 'Enviando...' : 'Confirmar pedido'}
          </button>
        </form>

        <aside className="card p-6 h-fit">
          <h2 className="font-medium text-gray-900 mb-4">Resumen</h2>
          <div className="space-y-3 mb-5">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-2 text-sm">
                <p className="text-gray-600">{item.nombre} x{item.cantidad}</p>
                <p className="text-gray-900">{formatCurrency(item.precio * item.cantidad)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
        </aside>
      </div>
    </div>
  )
}
