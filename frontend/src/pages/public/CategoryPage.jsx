import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCategoryProducts } from '../../hooks/useCatalog'
import ProductCard from '../../components/public/ProductCard'
import { PageLoader, EmptyState } from '../../components/shared/UI'

export default function CategoryPage() {
  const { slug } = useParams()
  const { data, isLoading } = useCategoryProducts(slug)

  if (isLoading) return <PageLoader />

  const category = data?.data?.category
  const products = data?.data?.products || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/catalogo" className="btn-ghost mb-6 inline-flex">
        <ArrowLeft className="w-4 h-4" /> Volver al catálogo
      </Link>

      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold text-neutral-800 mb-2">
          {category?.name || 'Categoría'}
        </h1>
        {category?.description && (
          <p className="text-neutral-400">{category.description}</p>
        )}
        <p className="text-sm text-neutral-400 mt-1">{products.length} productos</p>
      </div>

      {products.length === 0 ? (
        <EmptyState title="Sin productos" description="Esta categoría no tiene productos todavía." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
