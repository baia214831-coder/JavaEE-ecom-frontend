import { bizRequest } from '@/utils/request'

export const getProductPage = (params) => bizRequest.get('/products/page', { params })
export const getProductById = (id) => bizRequest.get(`/products/${id}`)
export const addProduct = (data) => bizRequest.post('/products', data)
export const updateProduct = (id, data) => bizRequest.put(`/products/${id}`, data)
export const deleteProduct = (id) => bizRequest.delete(`/products/${id}`)
