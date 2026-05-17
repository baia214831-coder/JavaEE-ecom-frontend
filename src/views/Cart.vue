<<template>
  <div>
    <el-card>
      <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
        <h2 style="margin: 0;">购物车</h2>
        <el-button
          v-if="cartData?.items?.length > 0"
          type="danger"
          plain
          @click="handleClear"
        >
          清空购物车
        </el-button>
      </div>

      <el-empty v-if="!cartData?.items || cartData.items.length === 0" description="购物车是空的，去商品页选购吧" />

      <el-table v-else :data="cartData.items" border>
        <el-table-column prop="productName" label="商品名称" min-width="150" />
        <el-table-column label="单价" width="120">
          <template #default="{ row }">
            ¥{{ row.price }}
          </template>
        </el-table-column>
        <el-table-column label="数量" width="150">
          <template #default="{ row }">
            <el-input-number
              v-model="row.quantity"
              :min="1"
              @change="updateRow(row)"
              size="small"
            />
          </template>
        </el-table-column>
        <el-table-column label="小计" width="120">
          <template #default="{ row }">
            ¥{{ row.subtotal?.toFixed(2) || (row.price * row.quantity).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="danger" @click="remove(row.productId)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="cartData?.items?.length > 0" style="margin-top: 20px; text-align: right;">
        <h3 style="margin: 0 0 15px 0;">
          共 {{ cartData.totalQuantity }} 件商品，总计：¥{{ cartData.totalAmount?.toFixed(2) || 0 }}
        </h3>
        <el-button type="primary" size="large" @click="checkout">去结算</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCart, updateCart, removeFromCart, clearCart } from '@/api/cart'
import { createOrder } from '@/api/order'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const cartData = ref(null)

// 兼容获取 userId
const getUserId = () => {
  return userStore.userInfo?.id
    || userStore.userInfo?.userId
    || userStore.userInfo?.uid
}

const loadCart = async () => {
  const userId = getUserId()
  if (!userId) return

  const res = await getCart({ userId })
  console.log('购物车返回:', res)

  // 直接赋值，因为 request.js 已经解包 res.data
  cartData.value = res || { items: [], totalAmount: 0, totalQuantity: 0 }
}

const updateRow = async (row) => {
  await updateCart({
    userId: getUserId(),
    productId: row.productId,
    quantity: row.quantity
  })
  ElMessage.success('数量已更新')
  loadCart()
}

const remove = async (productId) => {
  await removeFromCart({ userId: getUserId(), productId })
  ElMessage.success('已删除')
  loadCart()
}

const handleClear = async () => {
  try {
    await ElMessageBox.confirm('确定要清空购物车吗？', '提示', { type: 'warning' })
    await clearCart(getUserId())
    ElMessage.success('购物车已清空')
    cartData.value = { items: [], totalAmount: 0, totalQuantity: 0 }
  } catch (error) {}
}

const checkout = async () => {
  try {
    const items = cartData.value.items.map(i => ({
      productId: i.productId,
      quantity: i.quantity
    }))
    await createOrder({ userId: getUserId(), items })
    ElMessage.success('订单创建成功')
    loadCart()
  } catch (error) {}
}

onMounted(loadCart)
</script>
