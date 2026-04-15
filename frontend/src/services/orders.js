import api from './api'

export const ordersService = {
  create: (payload) => api.post('/pedidos', payload).then((response) => response.data),
}
