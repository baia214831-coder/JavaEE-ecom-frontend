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

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 1. 登录页放行（有token则跳首页）
  if (to.path === '/login') {
    if (userStore.token) return next('/')
    return next()
  }

  // 2. 未登录拦截
  if (!userStore.token) {
    return next('/login')
  }

  // 3. 角色权限校验
  if (to.meta && to.meta.roles && to.meta.roles.length > 0) {
    if (!to.meta.roles.includes(userStore.role)) {
      return next('/403')
    }
  }

  next()
})

export default router

