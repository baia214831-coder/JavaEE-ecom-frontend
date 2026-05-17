import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/views/Layout.vue'),
    redirect: '/products',
    children: [
      { path: 'products', name: 'ProductManage', component: () => import('@/views/ProductManage.vue') },
      { path: 'orders', name: 'OrderManage', component: () => import('@/views/OrderManage.vue') },
      { path: 'users', name: 'UserManage', component: () => import('@/views/UserManage.vue') },
      { path: 'cart', name: 'Cart', component: () => import('@/views/Cart.vue') },
      { path: 'report', name: 'Report', component: () => import('@/views/Report.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.path !== '/login' && !userStore.token) {
    return next('/login')
  }
  return next()
})

export default router
