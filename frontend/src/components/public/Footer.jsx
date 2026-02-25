import { Link } from 'react-router-dom'
import { useSiteTexts } from '../../hooks'
import { ShoppingBag } from 'lucide-react'

export default function Footer() {
  const { data: texts } = useSiteTexts()
  const getText = (key, fallback) => texts?.find((t) => t.key === key)?.value || fallback

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <ShoppingBag size={14} className="text-white" />
            </div>
            <span className="font-display text-lg text-white">
              {getText('brand_name', 'Catálogo')}
            </span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            {getText('footer_description', 'Tu tienda de productos de calidad.')}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Navegar</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Inicio</Link></li>
            <li><Link to="/catalogo" className="hover:text-white transition-colors">Catálogo</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Contacto</h4>
          <p className="text-sm text-gray-400">{getText('contact_email', 'hola@tienda.com')}</p>
          <p className="text-sm text-gray-400 mt-1">{getText('contact_phone', '+1 (555) 000-0000')}</p>
        </div>
      </div>

      <div className="border-t border-gray-800 px-4 sm:px-6 py-4">
        <p className="text-xs text-gray-500 text-center">
          © {new Date().getFullYear()} {getText('brand_name', 'Catálogo')}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
