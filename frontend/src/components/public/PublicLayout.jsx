import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Menu, X, ShoppingBag } from 'lucide-react'
import { useCategories, useSiteTexts } from '../../hooks/useCatalog'
import { clsx } from 'clsx'

function Navbar() {
  const [isOpen, setIsOpen]       = useState(false)
  const [scrolled, setScrolled]   = useState(false)
  const { data: categories }      = useCategories()
  const { data: texts }           = useSiteTexts('header')
  const navigate = useNavigate()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const brandName = texts?.data?.['header.brand_name']?.value || 'Catálogo'
  const cats = categories?.data || []

  return (
    <header className={clsx(
      'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
      scrolled ? 'bg-white/90 backdrop-blur-md shadow-soft' : 'bg-white/60 backdrop-blur-sm'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="font-display text-xl font-semibold text-neutral-800 tracking-tight">
            {brandName}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={({ isActive }) =>
              clsx('btn-ghost', isActive && 'bg-neutral-100 text-neutral-800')
            }>Inicio</NavLink>
            <NavLink to="/catalogo" className={({ isActive }) =>
              clsx('btn-ghost', isActive && 'bg-neutral-100 text-neutral-800')
            }>Catálogo</NavLink>
            {cats.slice(0, 4).map(cat => (
              <NavLink key={cat.id} to={`/categoria/${cat.slug}`} className={({ isActive }) =>
                clsx('btn-ghost', isActive && 'bg-neutral-100 text-neutral-800')
              }>{cat.name}</NavLink>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate('/catalogo')}
              className="btn-primary"
            >
              <ShoppingBag className="w-4 h-4" />
              Ver catálogo
            </button>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden btn-ghost p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-neutral-100 px-4 py-4 space-y-1 animate-slide-up">
          <NavLink to="/" end onClick={() => setIsOpen(false)}
            className="block btn-ghost w-full text-left">Inicio</NavLink>
          <NavLink to="/catalogo" onClick={() => setIsOpen(false)}
            className="block btn-ghost w-full text-left">Catálogo</NavLink>
          {cats.map(cat => (
            <NavLink key={cat.id} to={`/categoria/${cat.slug}`} onClick={() => setIsOpen(false)}
              className="block btn-ghost w-full text-left">{cat.name}</NavLink>
          ))}
        </div>
      )}
    </header>
  )
}

function Footer() {
  const { data: texts } = useSiteTexts('footer')
  const footerText = texts?.data?.['footer.copyright']?.value || '© 2024 Catálogo. Todos los derechos reservados.'

  return (
    <footer className="bg-neutral-800 text-neutral-400 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="font-display text-white text-lg mb-3">Catálogo</h4>
            <p className="text-sm leading-relaxed">
              {texts?.data?.['footer.description']?.value || 'Explora nuestra colección de productos.'}
            </p>
          </div>
          <div>
            <h5 className="text-white text-sm font-medium mb-3 uppercase tracking-wider">Navegación</h5>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm hover:text-white transition-colors">Inicio</Link></li>
              <li><Link to="/catalogo" className="text-sm hover:text-white transition-colors">Catálogo</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white text-sm font-medium mb-3 uppercase tracking-wider">Contacto</h5>
            <p className="text-sm">
              {texts?.data?.['footer.contact']?.value || 'info@catalogo.com'}
            </p>
          </div>
        </div>
        <div className="border-t border-neutral-700 pt-6 text-center">
          <p className="text-xs">{footerText}</p>
        </div>
      </div>
    </footer>
  )
}

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
