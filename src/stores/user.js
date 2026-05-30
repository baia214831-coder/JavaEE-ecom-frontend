import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken())
  const userInfo = ref(getUser())

  // 计算属性
  const role = computed(() => userInfo.value?.role || '')
  const permissions = computed(() => userInfo.value?.permissions || [])
  const isAdmin = computed(() => role.value === 'ROLE_ADMIN')
  const isManager = computed(() => role.value === 'ROLE_MANAGER')
  const isUser = computed(() => role.value === 'ROLE_USER')

  // 判断是否有某个细粒度权限（如 product:delete）
  const hasPermission = (perm) => {
    return permissions.value.includes(perm) || isAdmin.value
  }

  const setUserInfo = (data) => {
    // data 是后端 LoginResultVO：{ userId, username, token, expireTime, role, avatar, loginTime }
    token.value = data.token
    const info = {
      userId: data.userId,
      username: data.username,
      role: data.role,           // 关键：存储角色
      permissions: data.permissions || [], // 如有权限列表一并存储
      expireTime: data.expireTime,
      avatar: data.avatar
    }
    userInfo.value = info
    setToken(data.token)
    setUser(info)
  }

  const clearUser = () => {
    token.value = ''
    userInfo.value = null
    removeToken()
    removeUser()
  }

  return {
    token,
    userInfo,
    role,
    permissions,
    isAdmin,
    isManager,
    isUser,
    hasPermission,
    setUserInfo,
    clearUser
  }
})

