import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { usePublicProducts, useCategories } from '../../hooks'
import ProductCard from '../../components/public/ProductCard'
import { LoadingPage, Pagination, EmptyState } from '../../components/ui'
import { Package } from 'lucide-react'
import clsx from 'clsx'

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [page, setPage] = useState(1)

  const categorySlug = searchParams.get('categoria')
  const { data: categories } = useCategories()

  const selectedCategory = categories?.data?.find((c) => c.slug === categorySlug)

  const { data, isLoading } = usePublicProducts({
    search: searchParams.get('q') || undefined,
    category_id: selectedCategory?.id || undefined,
    page,
    per_page: 12,
  })

  useEffect(() => {
    setPage(1)
  }, [searchParams])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams((prev) => {
      if (search) prev.set('q', search)
      else prev.delete('q')
      return prev
    })
  }

  const clearCategory = () => {
    setSearchParams((prev) => {
      prev.delete('categoria')
      return prev
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-gray-900 mb-2">Catálogo</h1>
        <p className="text-gray-400">
          {data?.meta?.total != null ? `${data.meta.total} productos` : ''}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-56 shrink-0">
          <div className="card p-4">
            <p className="label mb-3">Categorías</p>
            <button
              onClick={clearCategory}
              className={clsx(
                'w-full text-left px-3 py-2 rounded-xl text-sm transition-colors',
                !categorySlug ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-500 hover:bg-gray-50'
              )}
            >
              Todas
            </button>
            {categories?.data?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSearchParams({ categoria: cat.slug })}
                className={clsx(
                  'w-full text-left px-3 py-2 rounded-xl text-sm transition-colors mt-0.5',
                  categorySlug === cat.slug
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-gray-500 hover:bg-gray-50'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative mb-6">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="input-field pl-10 pr-10"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setSearchParams((p) => { p.delete('q'); return p })
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={15} />
              </button>
            )}
          </form>

          {/* Active filters */}
          {(categorySlug || searchParams.get('q')) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-medium">
                  {selectedCategory.name}
                  <button onClick={clearCategory}><X size={12} /></button>
                </span>
              )}
              {searchParams.get('q') && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  "{searchParams.get('q')}"
                  <button onClick={() => {
                    setSearch('')
                    setSearchParams((p) => { p.delete('q'); return p })
                  }}><X size={12} /></button>
                </span>
              )}
            </div>
          )}

          {/* Grid */}
          {isLoading ? (
            <LoadingPage />
          ) : data?.data?.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Sin resultados"
              description="No se encontraron productos con esos filtros."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {data?.data?.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
              <Pagination
                currentPage={data?.meta?.current_page || 1}
                lastPage={data?.meta?.last_page || 1}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
