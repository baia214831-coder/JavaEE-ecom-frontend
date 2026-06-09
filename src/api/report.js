import { bizRequest } from '@/utils/request'

export const getUserWithProfile = (userId) => bizRequest.get(`/report/user/${userId}/with-profile`)
export const getUserWithOrders = (userId) => bizRequest.get(`/report/user/${userId}/with-orders`)
export const getOrderWithProducts = (orderId) => bizRequest.get(`/report/order/${orderId}/with-products`)
export const getOrderReportPage = (params) => bizRequest.get('/report/orders/page', { params })
