import { adminRequest } from '@/utils/request'

export const login = (data) => adminRequest.post('/auth/login', data)
export const logout = () => adminRequest.post('/auth/logout')
export const refresh = () => adminRequest.post('/auth/refresh')
