import { bizRequest } from '@/utils/request'

export const getUserPage = (params) => bizRequest.get('/users/page', { params })
export const updateUser = (id, data) => bizRequest.put(`/users/${id}`, data)
export const getUserProfile = (id) => bizRequest.get(`/users/${id}/profile`)
export const getUserOrders = (id) => bizRequest.get(`/users/${id}/orders`)
export const register = (data) => bizRequest.post('/users/register', data)
