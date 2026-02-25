import api from './api'

export const productsService = {
  getAll: (params) => api.get('/products', { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  create: (data) => api.post('/admin/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.post(`/admin/products/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/admin/products/${id}`),
  toggleFeatured: (id) => api.patch(`/admin/products/${id}/featured`),
}

export const categoriesService = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}/products`),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),
}

export const siteTextsService = {
  getAll: () => api.get('/site-texts'),
  getByGroup: (group) => api.get(`/site-texts/${group}`),
  update: (key, value) => api.put(`/admin/site-texts/${key}`, { value }),
  bulkUpdate: (data) => api.put('/admin/site-texts', { texts: data }),
}

export const imagesService = {
  getAll: () => api.get('/admin/images'),
  upload: (formData) => api.post('/admin/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/admin/images/${id}`),
}
