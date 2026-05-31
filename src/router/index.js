import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/403.vue')
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/views/Layout.vue'),
    redirect: '/products',
    children: [
      {
        path: 'products',
        name: 'ProductManage',
        component: () => import('@/views/ProductManage.vue'),
        meta: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER'] }
      },
      {
        path: 'orders',
        name: 'OrderManage',
        component: () => import('@/views/OrderManage.vue'),
        meta: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER'] }
      },
      {
        path: 'users',
        name: 'UserManage',
        component: () => import('@/views/UserManage.vue'),
        meta: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER'] } // 仅管理员可见
      },
      {
        path: 'cart',
        name: 'Cart',
        component: () => import('@/views/Cart.vue'),
        meta: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER'] }
      },
      {
        path: 'report',
        name: 'Report',
        component: () => import('@/views/Report.vue'),
        meta: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER'] }
      },
      {
        path: 'password',
        name: 'Password',
        component: () => import('@/views/Password.vue'),
        meta: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER'] }
      },
      {
        path: 'loginLogs',
        name: 'LoginLogs',
        component: () => import('@/views/LoginLog.vue'),
        meta: { roles: ['ROLE_ADMIN', 'ROLE_MANAGER'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const userStore = useUserStore()

  if (to.path === '/403') return true
  if (to.path === '/login') {
    if (userStore.token && userStore.role) return '/'
    return true
  }

  if (!userStore.token) return '/login'

  //关键：role 为空说明登录数据不完整，强制重新登录
  if (!userStore.role) {
    userStore.clearUser()
    return '/login'
  }

  if (to.meta?.roles && !to.meta.roles.includes(userStore.role)) {
    return '/403'
  }

  return true
})


export default router

