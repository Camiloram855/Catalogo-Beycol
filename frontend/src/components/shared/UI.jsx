import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

// Spinner
export function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <Loader2 className={clsx('animate-spin text-brand-500', sizes[size], className)} />
  )
}

// Page loader
export function PageLoader() {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-neutral-400">Cargando...</p>
    </div>
  )
}

// Empty state
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-3xl bg-pastel-lavender flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-brand-400" />
        </div>
      )}
      <h3 className="font-display text-lg text-neutral-700 mb-2">{title}</h3>
      {description && <p className="text-sm text-neutral-400 mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}

// Confirm modal
export function ConfirmModal({ isOpen, title, description, onConfirm, onCancel, loading }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative card p-6 max-w-sm w-full animate-scale-in">
        <h3 className="font-display text-lg text-neutral-800 mb-2">{title}</h3>
        <p className="text-sm text-neutral-500 mb-6">{description}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-ghost">Cancelar</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-danger"
          >
            {loading ? <Spinner size="sm" /> : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Badge
export function Badge({ children, color = 'lavender' }) {
  const colors = {
    lavender: 'bg-pastel-lavender text-brand-700',
    mint:     'bg-pastel-mint text-green-700',
    rose:     'bg-pastel-rose text-red-700',
    peach:    'bg-pastel-peach text-orange-700',
    sky:      'bg-pastel-sky text-blue-700',
    lemon:    'bg-pastel-lemon text-yellow-700',
  }
  return (
    <span className={clsx('badge', colors[color])}>
      {children}
    </span>
  )
}

// Image with fallback
export function ProductImage({ src, alt, className }) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const fullSrc = src?.startsWith('http') ? src : src ? `${apiUrl}/storage/${src}` : null

  return (
    <img
      src={fullSrc || '/placeholder.svg'}
      alt={alt}
      className={clsx('object-cover', className)}
      onError={(e) => { e.currentTarget.src = '/placeholder.svg' }}
    />
  )
}

// Stats card for admin dashboard
export function StatCard({ title, value, icon: Icon, color = 'lavender', trend }) {
  const colors = {
    lavender: 'bg-pastel-lavender text-brand-600',
    mint:     'bg-pastel-mint text-green-600',
    peach:    'bg-pastel-peach text-orange-600',
    sky:      'bg-pastel-sky text-blue-600',
  }
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={clsx('w-11 h-11 rounded-2xl flex items-center justify-center', colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-xs font-medium text-green-600 bg-pastel-mint px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-display font-semibold text-neutral-800 mb-1">{value}</p>
      <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">{title}</p>
    </div>
  )
}
