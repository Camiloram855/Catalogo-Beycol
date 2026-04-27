import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useProducts, useCategories, useSiteTexts } from '../../hooks'
import ProductCard from '../../components/public/ProductCard'
import { LoadingPage } from '../../components/ui'
import { resolveMediaUrl } from '../../utils/media'

export default function HomePage() {
  const { data: texts } = useSiteTexts()
  const { data: featured, isLoading } = useProducts({ featured: true, per_page: 6 })
  const { data: categories } = useCategories()

  const getText = (key, fallback) => texts?.find((t) => t.key === key)?.value || fallback
  const heroBackgroundImage = getText('hero_background_image', '').trim()

  return (
    <div>
      {/* Hero */}
    <section
      className="relative overflow-hidden"
      style={heroBackgroundImage ? {
        backgroundImage: `url(${resolveMediaUrl(heroBackgroundImage)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      } : undefined}
    >

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 md:py-36 flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-100 text-brand-700 rounded-full text-xs font-medium mb-6 animate-fade-in">
            <Sparkles size={13} />
            {getText('hero_badge', 'Nuevos productos disponibles')}
          </div>
          <h1 className="font-display text-5xl md:text-7xl text-gray-900 leading-tight max-w-2xl mb-6 animate-fade-up">
            {getText('hero_title', 'Descubre nuestra colección')}
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-lg mb-8 animate-fade-up delay-100">
            {getText('hero_subtitle', 'Productos cuidadosamente seleccionados para ti.')}
          </p>
          <div className="flex gap-3 animate-fade-up delay-200">
            <Link to="/catalogo" className="btn-primary text-base px-6 py-3">
              Ver catálogo <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories?.data?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex gap-3 flex-wrap">
            {categories.data.map((cat, i) => (
              <Link
                key={cat.id}
                to={`/catalogo?categoria=${cat.slug}`}
                className="px-5 py-2.5 rounded-2xl text-sm font-medium border border-gray-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-all duration-200"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs text-brand-600 font-semibold uppercase tracking-widest mb-1">Selección</p>
            <h2 className="font-display text-3xl md:text-4xl text-gray-900">
              {getText('featured_title', 'Productos destacados')}
            </h2>
          </div>
          <Link to="/catalogo" className="hidden md:flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition-colors">
            Ver todo <ArrowRight size={15} />
          </Link>
        </div>

        {isLoading ? (
          <LoadingPage />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured?.data?.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}

        {!isLoading && !featured?.data?.length && (
          <div className="text-center py-16 text-gray-400">
            <p>No hay productos destacados aún.</p>
          </div>
        )}
      </section>
    </div>
  )
}
