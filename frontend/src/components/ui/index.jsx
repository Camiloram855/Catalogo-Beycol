import clsx from 'clsx'
import { Loader2, X, AlertTriangle } from 'lucide-react'

// ──── Spinner ─────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, className }) {
  return <Loader2 size={size} className={clsx('animate-spin text-brand-500', className)} />
}

// ──── Loading Page ─────────────────────────────────────────────────────────────
export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size={32} />
    </div>
  )
}

// ──── Badge ───────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-gray-100 text-gray-600',
    brand: 'bg-brand-100 text-brand-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-yellow-50 text-yellow-700',
    danger: 'bg-red-50 text-red-600',
  }
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[variant], className
    )}>
      {children}
    </span>
  )
}

// ──── Modal ───────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={clsx(
        'relative w-full bg-white rounded-2xl shadow-xl animate-fade-up overflow-hidden',
        sizes[size]
      )}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-display text-xl text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

// ──── Confirm Dialog ──────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  if (!open) return null
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
          <AlertTriangle size={24} className="text-red-500" />
        </div>
        <p className="text-gray-600 text-sm">{message}</p>
        <div className="flex gap-3 w-full">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-danger flex-1"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Spinner size={16} /> : null}
            Eliminar
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ──── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
          <Icon size={28} className="text-gray-300" />
        </div>
      )}
      <h3 className="font-display text-lg text-gray-700 mb-1">{title}</h3>
      {description && <p className="text-gray-400 text-sm mb-4">{description}</p>}
      {action}
    </div>
  )
}

// ──── Pagination ──────────────────────────────────────────────────────────────
export function Pagination({ currentPage, lastPage, onPageChange }) {
  if (lastPage <= 1) return null

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={clsx(
            'w-9 h-9 rounded-xl text-sm font-medium transition-all',
            page === currentPage
              ? 'bg-brand-600 text-white'
              : 'text-gray-500 hover:bg-gray-100'
          )}
        >
          {page}
        </button>
      ))}
    </div>
  )
}

// ──── Input ───────────────────────────────────────────────────────────────────
export function Input({ label, error, ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <input className={clsx('input-field', error && 'border-red-300 focus:ring-red-200')} {...props} />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ──── Textarea ────────────────────────────────────────────────────────────────
export function Textarea({ label, error, ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <textarea
        className={clsx('input-field resize-none', error && 'border-red-300 focus:ring-red-200')}
        rows={4}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ──── Select ──────────────────────────────────────────────────────────────────
export function Select({ label, error, options, placeholder, ...props }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <select
        className={clsx('input-field', error && 'border-red-300 focus:ring-red-200')}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
