import request from '@/utils/request'

export const getUserWithProfile = (userId) => request.get(`/report/user/${userId}/with-profile`)
export const getUserWithOrders = (userId) => request.get(`/report/user/${userId}/with-orders`)
export const getOrderWithProducts = (orderId) => request.get(`/report/order/${orderId}/with-products`)
export const getOrderReportPage = (params) => request.get('/report/orders/page', { params })
