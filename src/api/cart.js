import { bizRequest } from '@/utils/request'

export const addToCart = (data) => bizRequest.post('/cart/add', data)
export const updateCart = (data) => bizRequest.put('/cart/update', data)
export const removeFromCart = (params) => bizRequest.delete('/cart/remove', { params })
export const getCart = (params) => bizRequest.get('/cart/list', { params })
export const clearCart = (userId) => bizRequest.delete('/cart/clear', { params: { userId } })
