import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { useProduct } from '../../hooks'
import { LoadingPage, Badge } from '../../components/ui'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { data, isLoading, error } = useProduct(id)
  const [activeImage, setActiveImage] = useState(0)

  if (isLoading) return <LoadingPage />
  if (error || !data?.data) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-400">Producto no encontrado.</p>
      <Link to="/catalogo" className="btn-secondary mt-4">Volver al catálogo</Link>
    </div>
  )

  const product = data.data
  const images = product.images || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/catalogo" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8">
        <ArrowLeft size={16} /> Volver al catálogo
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4 relative group">
            {images[activeImage] ? (
              <img
                src={images[activeImage].url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-200 text-7xl">🛍</div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((p) => (p - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setActiveImage((p) => (p + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${i === activeImage ? 'border-brand-400' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.category && (
            <Badge variant="brand" className="mb-3 self-start">{product.category.name}</Badge>
          )}
          <h1 className="font-display text-4xl text-gray-900 mb-4">{product.name}</h1>
          {product.price != null && (
            <div className="text-3xl font-semibold text-gray-900 mb-6">
              ${Number(product.price).toLocaleString('es')}
            </div>
          )}
          {product.description && (
            <p className="text-gray-500 leading-relaxed mb-6">{product.description}</p>
          )}
          {product.stock != null && (
            <p className={`text-sm font-medium mb-6 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `${product.stock} en stock` : 'Sin stock'}
            </p>
          )}
          {product.sku && (
            <p className="text-xs text-gray-400 font-mono">SKU: {product.sku}</p>
          )}
        </div>
      </div>
    </div>
  )
}
