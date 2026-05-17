import request from '@/utils/request'

export const getProductPage = (params) => request.get('/products/page', { params })
export const getProductById = (id) => request.get(`/products/${id}`)
export const addProduct = (data) => request.post('/products', data)
export const updateProduct = (id, data) => request.put(`/products/${id}`, data)
export const deleteProduct = (id) => request.delete(`/products/${id}`)
