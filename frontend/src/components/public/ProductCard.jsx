import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ShoppingCart } from 'lucide-react'
import { Badge } from '../ui'
import { useCart } from '../../context/CartContext'
import clsx from 'clsx'

const PASTEL_COLORS = [
  'bg-pastel-rose',
  'bg-pastel-peach',
  'bg-pastel-yellow',
  'bg-pastel-mint',
  'bg-pastel-sky',
  'bg-pastel-lavender',
]

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart()
  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]
  const bgColor = PASTEL_COLORS[index % PASTEL_COLORS.length]

  const handleAddToCart = (event) => {
    event.preventDefault()
    event.stopPropagation()

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: primaryImage?.url || null,
    })

    toast.success('Producto agregado al carrito')
  }

  return (
    <div
      className="group block animate-fade-up"
      style={{ animationDelay: `${(index % 6) * 60}ms`, animationFillMode: 'both' }}
    >
      <div className="card overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
        <Link to={`/producto/${product.id}`} className="block">
          <div className={clsx('aspect-square overflow-hidden', primaryImage ? 'bg-gray-50' : bgColor)}>
            {primaryImage ? (
              <img
                src={primaryImage.url}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl opacity-30">IMG</span>
              </div>
            )}
          </div>
        </Link>

        <div className="p-4 flex-1 flex flex-col">
          {product.category && (
            <Badge variant="brand" className="mb-2">{product.category.name}</Badge>
          )}

          <Link to={`/producto/${product.id}`}>
            <h3 className="font-display text-gray-900 text-lg leading-snug mb-1 group-hover:text-brand-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {product.description && (
            <p className="text-gray-400 text-sm line-clamp-2 mb-3">{product.description}</p>
          )}

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-3">
              {product.price != null && (
                <span className="font-semibold text-gray-900 text-lg">
                  ${Number(product.price).toLocaleString('es-CO')}
                </span>
              )}
              {product.is_featured && (
                <Badge variant="warning">Destacado</Badge>
              )}
            </div>

            <button type="button" className="btn-secondary w-full justify-center" onClick={handleAddToCart}>
              <ShoppingCart size={16} />
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
