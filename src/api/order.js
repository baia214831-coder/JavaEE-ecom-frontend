import request from '@/utils/request'

export const createOrder = (data) => request.post('/orders', data)
export const getOrderDetail = (id) => request.get(`/orders/${id}`)
export const getOrderPage = (params) => request.get('/orders/page', { params })
export const updateOrderStatus = (id, data) => request.put(`/orders/${id}/status`, data)
export const cancelOrder = (id) => request.delete(`/orders/${id}`)
