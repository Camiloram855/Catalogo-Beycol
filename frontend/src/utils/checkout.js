const WHATSAPP_NUMBER = '573223397243'

export function formatCurrency(value) {
  return Number(value || 0).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })
}

export function buildWhatsAppMessage({ cliente, productos, total, pedidoId }) {
  const lines = [
    'Hola, quiero confirmar este pedido:',
    '',
    `Pedido: #${pedidoId}`,
    `Nombre: ${cliente.nombre} ${cliente.apellido}`,
    `Telefono: ${cliente.telefono}`,
    `Correo: ${cliente.correo}`,
    `Direccion: ${cliente.direccion}`,
    `Ciudad/Departamento: ${cliente.ciudad}`,
    `Comentarios: ${cliente.comentarios || 'Sin comentarios'}`,
    '',
    'Productos:',
    ...productos.map(
      (item) => `- ${item.nombre} x${item.cantidad} (${formatCurrency(item.precio)})`,
    ),
    '',
    `Total: ${formatCurrency(total)}`,
  ]

  return lines.join('\n')
}

export function buildWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
