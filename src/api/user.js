import request from '@/utils/request'

export const register = (data) => request.post('/users/register', data)
export const getUserPage = (params) => request.get('/users/page', { params })
export const getUserProfile = (id) => request.get(`/users/${id}/profile`)
export const getUserOrders = (id) => request.get(`/users/${id}/orders`)
export const updateUser = (id, data) => request.put(`/users/${id}`, data)
