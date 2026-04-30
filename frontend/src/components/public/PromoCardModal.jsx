import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { useSiteTexts } from '../../hooks'
import { resolveMediaUrl } from '../../utils/media'

const SESSION_KEY = 'promo_card_seen'

export default function PromoCardModal() {
  const { data: texts } = useSiteTexts()
  const [open, setOpen] = useState(false)

  const config = useMemo(() => {
    const map = {}
    ;(texts || []).forEach((t) => {
      map[t.key] = t.value
    })
    return map
  }, [texts])

  const promoEnabled = (config.promo_card_enabled || '0') === '1'
  const promoImage = (config.promo_card_image || '').trim()

  useEffect(() => {
    if (!promoEnabled || !promoImage) {
      setOpen(false)
      return
    }

    const alreadySeen = sessionStorage.getItem(SESSION_KEY) === '1'
    if (!alreadySeen) {
      setOpen(true)
      sessionStorage.setItem(SESSION_KEY, '1')
    }
  }, [promoEnabled, promoImage])

  if (!open || !promoEnabled || !promoImage) return null

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-white text-gray-600 hover:text-gray-900 shadow flex items-center justify-center"
          aria-label="Cerrar promoción"
        >
          <X size={18} />
        </button>

        <div className="rounded-2xl overflow-hidden shadow-2xl bg-white">
          <div className="w-full aspect-[9/16] bg-gray-100">
            <img
              src={resolveMediaUrl(promoImage)}
              alt="Promoción destacada"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
