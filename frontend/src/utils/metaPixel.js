const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID

function hasPixel() {
  return typeof window !== 'undefined' && typeof window.fbq === 'function' && Boolean(PIXEL_ID)
}

export function initMetaPixel() {
  if (typeof window === 'undefined' || !PIXEL_ID || window.fbq) return

  /* eslint-disable */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    }
    if (!f._fbq) f._fbq = n
    n.push = n
    n.loaded = true
    n.version = '2.0'
    n.queue = []
    t = b.createElement(e)
    t.async = true
    t.src = v
    s = b.getElementsByTagName(e)[0]
    s.parentNode.insertBefore(t, s)
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
  /* eslint-enable */

  window.fbq('init', PIXEL_ID)
}

export function trackPageView() {
  if (!hasPixel()) return
  window.fbq('track', 'PageView')
}

export function trackMetaEvent(eventName, params = {}, eventId) {
  if (!hasPixel()) return
  if (eventId) {
    window.fbq('track', eventName, params, { eventID: eventId })
    return
  }
  window.fbq('track', eventName, params)
}

export function buildEventId(prefix = 'evt') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}
