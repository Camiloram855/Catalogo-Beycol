import api from './api'

function normalizePaginated(payload) {
  if (!payload || typeof payload !== 'object') return payload
  if (payload.meta) return payload

  const hasLaravelPaginationShape =
    Array.isArray(payload.data) &&
    payload.current_page != null &&
    payload.last_page != null

  if (!hasLaravelPaginationShape) return payload

  return {
    ...payload,
    meta: {
      current_page: payload.current_page,
      last_page: payload.last_page,
      per_page: payload.per_page,
      total: payload.total,
      from: payload.from,
      to: payload.to,
    },
  }
}

export const productsService = {
  getAll: (params = {}) => api.get('/admin/products', { params }).then((r) => normalizePaginated(r.data)),
  getOne: (id) => api.get(`/admin/products/${id}`).then((r) => r.data),
  create: (data) => api.post('/products', data).then((r) => r.data),
  update: (id, data) => api.put(`/products/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/products/${id}`).then((r) => r.data),

  // Images
  uploadImage: (productId, formData) =>
    api.post(`/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  deleteImage: (productId, imageId) =>
    api.delete(`/products/${productId}/images/${imageId}`).then((r) => r.data),
  setPrimaryImage: (productId, imageId) =>
    api.patch(`/products/${productId}/images/${imageId}/primary`).then((r) => r.data),
}

export const publicProductsService = {
  getAll: (params = {}) => api.get('/products', { params }).then((r) => normalizePaginated(r.data)),
  getOne: (id) => api.get(`/products/${id}`).then((r) => r.data),
}

export const categoriesService = {
  getAll: () => api.get('/categories').then((r) => r.data),
  create: (data) => api.post('/categories', data).then((r) => r.data),
  update: (id, data) => api.put(`/categories/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
}

export const siteTextsService = {
  getAll: () => api.get('/site-texts').then((r) => r.data),
  update: (key, value) => api.patch(`/site-texts/${key}`, { value }).then((r) => r.data),
  bulkUpdate: (data) => api.put('/site-texts', { texts: data }).then((r) => r.data),
  uploadHeroBackground: (formData) =>
    api.post('/site-texts/hero-background', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
  uploadPromoCard: (formData) =>
    api.post('/site-texts/promo-card', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
}

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials).then((r) => r.data.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data.data),
}
