import { bizRequest } from '@/utils/request'

export const createOrder = (data) => bizRequest.post('/orders', data)
export const getOrderDetail = (id) => bizRequest.get(`/orders/${id}`)
export const getOrderPage = (params) => bizRequest.get('/orders/page', { params })
export const updateOrderStatus = (id, data) => bizRequest.put(`/orders/${id}/status`, data)
export const cancelOrder = (id) => bizRequest.delete(`/orders/${id}`)
