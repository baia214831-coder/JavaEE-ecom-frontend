import request from '@/utils/request'

export const addToCart = (data) => request.post('/cart/add', data)
export const updateCart = (data) => request.put('/cart/update', data)
export const removeFromCart = (params) => request.delete('/cart/remove', { params })
export const getCart = (params) => request.get('/cart/list', { params })
export const clearCart = (userId) => request.delete('/cart/clear', { params: { userId } })
