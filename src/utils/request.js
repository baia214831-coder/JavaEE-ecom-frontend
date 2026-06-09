import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken, removeUser } from './auth'

// ==================== 业务服务：8081（商品/订单/购物车/用户/报表）====================
const bizRequest = axios.create({
  baseURL: 'http://localhost:8081/api',
  timeout: 10000,
  withCredentials: true
})

// ==================== 管理服务：8082（登录/登出/刷新/权限）====================
const adminRequest = axios.create({
  baseURL: 'http://localhost:8082/api',
  timeout: 10000,
  withCredentials: true
})

// 8082 的白名单
const adminWhiteList = ['/auth/login', '/auth/register']

// 给 adminRequest 添加 Token 拦截器
adminRequest.interceptors.request.use(
  (config) => {
    const token = getToken()
    const isWhite = adminWhiteList.some(url => config.url?.includes(url))
    if (token && !isWhite) {
      config.headers.Authorization = 'Bearer ' + token
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 给 bizRequest 也添加 Token 拦截器
bizRequest.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = 'Bearer ' + token
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 统一响应处理
const handleResponse = (response) => {
  const res = response.data
  if (res.code === 200) {
    return res.data
  }

  const errMsg = res.message || res.msg || '请求失败'

  if (res.code === 401) {
    ElMessage.error(errMsg || '登录已过期，请重新登录')
    removeToken()
    removeUser()
    window.location.href = '/login'
    return Promise.reject(new Error(errMsg))
  }

  if (res.code === 403) {
    ElMessage.error(errMsg || '权限不足，无法操作')
    return Promise.reject(new Error(errMsg))
  }

  ElMessage.error(errMsg)
  return Promise.reject(new Error(errMsg))
}

const handleError = (error) => {
  const response = error.response
  if (response) {
    const data = response.data || {}
    const status = response.status
    const errMsg = data.msg || data.message || `请求失败: ${status}`

    if (status === 401 || data.code === 401) {
      ElMessage.error(errMsg || '登录已过期，请重新登录')
      removeToken()
      removeUser()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else if (status === 403 || data.code === 403) {
      ElMessage.error(errMsg || '权限不足，无法操作')
    } else {
      ElMessage.error(errMsg)
    }
  } else {
    ElMessage.error('网络连接异常，请检查后端服务是否启动')
  }
  return Promise.reject(error)
}

bizRequest.interceptors.response.use(handleResponse, handleError)
adminRequest.interceptors.response.use(handleResponse, handleError)

export { bizRequest, adminRequest }
