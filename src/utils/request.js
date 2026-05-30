import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken, removeUser } from './auth'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true // 后端 CORS 允许了 credentials
})

// 不需要 Token 的白名单
const whiteList = ['/auth/login', '/auth/register', '/users/register', '/public/']

request.interceptors.request.use(
  (config) => {
    const token = getToken()
    const isWhite = whiteList.some(url => config.url?.includes(url))
    if (token && !isWhite) {
      config.headers.Authorization = 'Bearer ' + token
    }
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 后端 Result 成功码（StatusCode.SUCCESS = 200）
    if (res.code === 200) {
      return res.data
    }

    // 统一兼容 msg 和 message
    const errMsg = res.message || res.msg || '请求失败'

    // 401：未登录或 Token 过期
    if (res.code === 401) {
      ElMessage.error(errMsg || '登录已过期，请重新登录')
      removeToken()
      removeUser()
      window.location.href = '/login'
      return Promise.reject(new Error(errMsg))
    }

    // 403：权限不足
    if (res.code === 403) {
      ElMessage.error(errMsg || '权限不足，无法操作')
      return Promise.reject(new Error(errMsg))
    }

    // 其他业务错误
    ElMessage.error(errMsg)
    return Promise.reject(new Error(errMsg))
  },
  (error) => {
    const response = error.response
    if (response) {
      const data = response.data || {}
      const status = response.status
      // 兼容 Spring Security 处理器返回的 msg 和业务异常的 message
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
)

export default request
