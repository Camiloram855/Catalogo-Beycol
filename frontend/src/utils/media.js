function getBackendOrigin() {
  const apiUrl = import.meta.env.VITE_API_URL

  if (!apiUrl) {
    const { protocol, hostname, origin } = window.location
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:8000`
    }
    return origin
  }

  try {
    return new URL(apiUrl, window.location.origin).origin
  } catch (_) {
    const { protocol, hostname, origin } = window.location
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:8000`
    }
    return origin
  }
}

export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return ''
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('//')) return `${window.location.protocol}${url}`

  const origin = getBackendOrigin()
  return url.startsWith('/') ? `${origin}${url}` : `${origin}/${url}`
}
