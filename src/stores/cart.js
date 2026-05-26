import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCart, addToCart, updateCart, removeFromCart, clearCart } from '@/api/cart'

export const useCartStore = defineStore('cart', () => {
  const cartList = ref([])
  const totalQuantity = ref(0)
  const totalAmount = ref(0)
  const loading = ref(false)

  // 购物车商品总数（所有商品数量之和）
  const cartCount = computed(() => cartList.value.reduce((sum, item) => sum + (item.quantity || 0), 0))

  const fetchCart = async (params = {}) => {
    loading.value = true
    const res = await getCart(params)    // CartVO 字段：items / totalQuantity / totalAmount / totalSkuCount
    cartList.value = res.items || []
    totalQuantity.value = res.totalQuantity || 0
    totalAmount.value = res.totalAmount || 0
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
    totalQuantity.value = 0
    totalAmount.value = 0
  }

  return {
    cartList,
    totalQuantity,
    totalAmount,
    loading,
    cartCount,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clearAll
  }
})
