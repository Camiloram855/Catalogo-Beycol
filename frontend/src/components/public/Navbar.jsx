import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ShoppingBag } from 'lucide-react'
import { useCategories, useSiteTexts } from '../../hooks'
import clsx from 'clsx'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { data: categories } = useCategories()
  const { data: texts } = useSiteTexts()

  const brandName = texts?.find((t) => t.key === 'brand_name')?.value || 'Catálogo'

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center">
            <ShoppingBag size={16} className="text-white" />
          </div>
          <span className="font-display text-xl text-gray-900">{brandName}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={clsx(
              'text-sm font-medium transition-colors',
              location.pathname === '/' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'
            )}
          >
            Inicio
          </Link>
          <Link
            to="/catalogo"
            className={clsx(
              'text-sm font-medium transition-colors',
              location.pathname.startsWith('/catalogo') ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'
            )}
          >
            Catálogo
          </Link>
          {categories?.data?.slice(0, 4).map((cat) => (
            <Link
              key={cat.id}
              to={`/catalogo?categoria=${cat.slug}`}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-3 animate-fade-in">
          <Link to="/" onClick={() => setOpen(false)} className="text-sm text-gray-700 py-2">Inicio</Link>
          <Link to="/catalogo" onClick={() => setOpen(false)} className="text-sm text-gray-700 py-2">Catálogo</Link>
          {categories?.data?.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalogo?categoria=${cat.slug}`}
              onClick={() => setOpen(false)}
              className="text-sm text-gray-500 py-2 pl-4 border-l-2 border-pastel-lavender"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
