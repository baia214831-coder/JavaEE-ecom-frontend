import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken, removeUser } from './auth'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) config.headers.Authorization = 'Bearer ' + token
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => {
    const res = response.data

    // 后端返回字段是 message，不是 msg
    if (res.code !== 200) {
      // 401：未登录或Token过期（AOP权限切面抛出）
      if (res.code === 401) {
        ElMessage.error(res.message || '登录已过期，请重新登录')
        // 清除本地存储
        removeToken()
        removeUser()
        // 跳转到登录页
        window.location.href = '/login'
        return Promise.reject(new Error(res.message || '未登录'))
      }

      // 403：权限不足（AOP权限切面抛出）
      if (res.code === 403) {
        ElMessage.error(res.message || '权限不足，无法操作')
        return Promise.reject(new Error(res.message || '权限不足'))
      }

      // 其他业务错误（参数校验失败、业务异常等）
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }

    return res.data
  },
  (error) => {
    // HTTP错误（网络断开、500等）
    // 后端异常返回也是 Result 格式，字段同样是 message
    const msg = error.response?.data?.message || '网络错误'
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export default request
