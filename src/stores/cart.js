import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCart, addToCart, updateCart, removeFromCart, clearCart } from '@/api/cart'

export const useCartStore = defineStore('cart', () => {
  const cartList = ref([])
  const total = ref(0)
  const loading = ref(false)

  const cartCount = computed(() => cartList.value.reduce((sum, item) => sum + item.quantity, 0))

  const fetchCart = async (params = {}) => {
    loading.value = true
    const res = await getCart(params)
    cartList.value = res.list || []
    total.value = res.total || 0
    loading.value = false
  }

  const addItem = async (data) => {
    await addToCart(data)
    await fetchCart() // 添加后刷新
  }

  const updateItem = async (data) => {
    await updateCart(data)
    await fetchCart()
  }

  const removeItem = async (params) => {
    await removeFromCart(params)
    await fetchCart()
  }

  const clearAll = async () => {
    await clearCart()
    cartList.value = []
    total.value = 0
  }

  return { cartList, total, loading, cartCount, fetchCart, addItem, updateItem, removeItem, clearAll }
})
