import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken())
  const userInfo = ref(getUser())

  const setUserInfo = (data) => {
    token.value = data.token
    userInfo.value = data.userInfo || data
    setToken(data.token)
    setUser(data.userInfo || data)
  }

  const clearUser = () => {
    token.value = ''
    userInfo.value = null
    removeToken()
    removeUser()
  }

  return { token, userInfo, setUserInfo, clearUser }
})
