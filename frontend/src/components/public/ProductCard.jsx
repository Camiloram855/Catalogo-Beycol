import { Link } from 'react-router-dom'
import { Badge } from '../ui'
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
  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]
  const bgColor = PASTEL_COLORS[index % PASTEL_COLORS.length]

  return (
    <Link
      to={`/producto/${product.id}`}
      className="group block animate-fade-up"
      style={{ animationDelay: `${(index % 6) * 60}ms`, animationFillMode: 'both' }}
    >
      <div className="card overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className={clsx('aspect-square overflow-hidden', primaryImage ? 'bg-gray-50' : bgColor)}>
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl opacity-30">🛍</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {product.category && (
            <Badge variant="brand" className="mb-2">{product.category.name}</Badge>
          )}
          <h3 className="font-display text-gray-900 text-lg leading-snug mb-1 group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-gray-400 text-sm line-clamp-2 mb-3">{product.description}</p>
          )}
          <div className="flex items-center justify-between">
            {product.price != null && (
              <span className="font-semibold text-gray-900 text-lg">
                ${Number(product.price).toLocaleString('es')}
              </span>
            )}
            {product.is_featured && (
              <Badge variant="warning">Destacado</Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
