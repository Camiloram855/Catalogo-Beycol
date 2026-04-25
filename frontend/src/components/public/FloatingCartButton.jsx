import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../../context/CartContext'

export default function FloatingCartButton() {
  const { totalItems } = useCart()

  return (
    <Link
      to="/carrito"
      className="md:hidden fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700 active:scale-95 transition-all duration-200 inline-flex items-center justify-center"
      aria-label="Abrir carrito"
    >
      <ShoppingCart size={22} />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 bg-white text-brand-700 rounded-full text-xs font-semibold inline-flex items-center justify-center border border-brand-100">
          {totalItems}
        </span>
      )}
    </Link>
  )
}
