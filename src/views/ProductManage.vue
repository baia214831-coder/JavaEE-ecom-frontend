<<template>
  <div>
    <el-card>
      <div style="margin-bottom:15px">
        <el-input v-model="query.name" placeholder="商品名称" style="width:200px;margin-right:10px" clearable />
        <el-input v-model="query.category" placeholder="分类" style="width:200px;margin-right:10px" clearable />
        <el-button type="primary" @click="loadData">查询</el-button>
        <el-button type="success" @click="openDialog()">新增商品</el-button>
      </div>
      <el-table :data="tableData" border v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="category" label="分类" />
        <el-table-column prop="price" label="价格" />
        <el-table-column prop="stock" label="库存" />
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <el-button size="small" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
            <el-button size="small" type="warning" @click="openCartDialog(row)" :disabled="row.stock <= 0">加入购物车</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="query.pageNum"
        v-model:page-size="query.pageSize"
        :total="total"
        layout="total, prev, pager, next"
        style="margin-top:15px;justify-content:flex-end"
        @change="loadData"
      />
    </el-card>

    <!-- 商品编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑商品' : '新增商品'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="分类"><el-input v-model="form.category" /></el-form-item>
        <el-form-item label="价格"><el-input-number v-model="form.price" :min="0" /></el-form-item>
        <el-form-item label="库存"><el-input-number v-model="form.stock" :min="0" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 加入购物车弹窗 -->
    <el-dialog v-model="cartDialogVisible" title="加入购物车" width="400px">
      <div style="margin-bottom:10px"><strong>商品：</strong>{{ cartForm.name }}</div>
      <div style="margin-bottom:10px"><strong>单价：</strong>¥{{ cartForm.price }}</div>
      <div style="margin-bottom:15px"><strong>库存：</strong>{{ cartForm.stock }}</div>
      <el-form :model="cartForm">
        <el-form-item label="数量">
          <el-input-number v-model="cartForm.quantity" :min="1" :max="cartForm.stock" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cartDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddToCart">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProductPage, addProduct, updateProduct, deleteProduct } from '@/api/product'
import { addToCart } from '@/api/cart'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(false)
const query = ref({ pageNum: 1, pageSize: 10, name: '', category: '' })
const tableData = ref([])
const total = ref(0)
const dialogVisible = ref(false)
const form = ref({ id: null, name: '', category: '', price: 0, stock: 0, description: '' })

const cartDialogVisible = ref(false)
const cartForm = ref({ productId: null, name: '', price: 0, stock: 0, quantity: 1 })

const loadData = async () => {
  loading.value = true
  const res = await getProductPage(query.value)
  tableData.value = res.records || []
  total.value = res.total || 0
  loading.value = false
}

const openDialog = (row = null) => {
  if (row) form.value = { ...row }
  else form.value = { id: null, name: '', category: '', price: 0, stock: 0, description: '' }
  dialogVisible.value = true
}

const submitForm = async () => {
  if (form.value.id) {
    await updateProduct(form.value.id, form.value)
    ElMessage.success('修改成功')
  } else {
    await addProduct(form.value)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  loadData()
}

// 实验三要求：敏感操作（删除）二次校验
const handleDelete = async (row) => {
  try {
    // 第一步：确认删除
    await ElMessageBox.confirm(
      `确定删除商品 "${row.name}" 吗？删除后不可恢复！`,
      '删除确认',
      { type: 'warning', confirmButtonText: '确认删除' }
    )

    // 第二步：二次校验，输入登录密码确认
    await ElMessageBox.prompt(
      '请输入您的登录密码以确认此敏感操作',
      '二次校验',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        inputType: 'password',
        inputValidator: (val) => {
          if (!val) return '密码不能为空'
          if (val.length < 3) return '密码长度不足'
          return true
        }
      }
    )

    // 调用删除（如后端需要校验密码，可把输入的密码作为参数传入）
    await deleteProduct(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    if (e === 'cancel' || e === 'close') {
      // 用户取消，静默处理
    } else {
      console.error('删除失败', e)
    }
  }
}

const openCartDialog = (row) => {
  if (!userStore.token) {
    ElMessage.warning('请先登录')
    return
  }
  cartForm.value = {
    productId: row.id,
    name: row.name,
    price: row.price,
    stock: row.stock,
    quantity: 1
  }
  cartDialogVisible.value = true
}

const submitAddToCart = async () => {
  const userId = userStore.userInfo?.userId || userStore.userInfo?.id
  if (!userId) {
    ElMessage.error('无法获取用户ID，请重新登录')
    return
  }
  await addToCart({
    userId: userId,
    productId: cartForm.value.productId,
    quantity: cartForm.value.quantity
  })
  ElMessage.success('已加入购物车')
  cartDialogVisible.value = false
}

onMounted(loadData)
</script>
