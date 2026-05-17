<<template>
  <div>
    <el-card>
      <div style="margin-bottom:15px">
        <el-select v-model="query.status" placeholder="订单状态" clearable style="width:150px;margin-right:10px">
          <el-option label="待支付" :value="0" />
          <el-option label="已支付" :value="1" />
          <el-option label="已发货" :value="2" />
          <el-option label="已完成" :value="3" />
          <el-option label="已取消" :value="4" />
        </el-select>
        <el-button type="primary" @click="loadData">查询</el-button>
      </div>

      <el-table :data="tableData" border v-loading="loading">
        <el-table-column label="订单ID" width="80">
          <template #default="{ row }">
            {{ row.id ?? row.orderId ?? '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column label="总金额" width="120">
          <template #default="{ row }">
            ¥{{ row.totalAmount ?? row.totalPrice ?? row.total_price ?? 0 }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="180" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleDetail(row)">详情</el-button>
            <el-button size="small" type="warning" @click="handleStatus(row)">改状态</el-button>
            <el-button size="small" type="danger" @click="handleCancel(row)">取消</el-button>
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

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="600px">
      <el-descriptions :column="2" border v-if="detailData">
        <el-descriptions-item label="订单ID">{{ detailData.id ?? detailData.orderId ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="订单号">{{ detailData.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="总金额">¥{{ detailData.totalAmount ?? detailData.totalPrice ?? detailData.total_price ?? 0 }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ statusText(detailData.status) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 改状态弹窗 -->
    <el-dialog v-model="statusVisible" title="修改订单状态" width="400px">
      <el-form>
        <el-form-item label="新状态">
          <el-select v-model="newStatus" placeholder="请选择">
            <el-option label="待支付" :value="0" />
            <el-option label="已支付" :value="1" />
            <el-option label="已发货" :value="2" />
            <el-option label="已完成" :value="3" />
            <el-option label="已取消" :value="4" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmStatus">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderPage, getOrderDetail, updateOrderStatus, cancelOrder } from '@/api/order'

const loading = ref(false)
const query = ref({ pageNum: 1, pageSize: 10, status: null })
const tableData = ref([])
const total = ref(0)

const detailVisible = ref(false)
const detailData = ref(null)
const statusVisible = ref(false)
const newStatus = ref(null)
const currentOrderId = ref(null)

const statusMap = {
  0: { text: '待支付', type: 'info' },
  1: { text: '已支付', type: 'success' },
  2: { text: '已发货', type: 'warning' },
  3: { text: '已完成', type: 'success' },
  4: { text: '已取消', type: 'danger' }
}

const statusText = (s) => statusMap[s]?.text || s
const statusType = (s) => statusMap[s]?.type || ''

// 关键修复：提取订单ID，兼容 id / orderId
const getOrderId = (row) => {
  const id = row?.id ?? row?.orderId
  console.log('提取订单ID:', id, '行数据:', row) // 调试用
  return id
}

const loadData = async () => {
  loading.value = true
  const res = await getOrderPage(query.value)
  tableData.value = res.records || res.list || []
  total.value = res.total || 0
  loading.value = false
}

const handleDetail = async (row) => {
  const id = getOrderId(row)
  if (id === null || id === undefined) {
    ElMessage.error('订单ID无效，无法查看详情')
    return
  }
  const res = await getOrderDetail(id)
  detailData.value = res
  detailVisible.value = true
}

const handleStatus = (row) => {
  const id = getOrderId(row)
  if (id === null || id === undefined) {
    ElMessage.error('订单ID无效，无法修改状态')
    console.log('当前行数据:', row)
    return
  }
  currentOrderId.value = id
  newStatus.value = null
  statusVisible.value = true
}

// 关键修复：body 里必须带上 orderId，否则后端 @Valid 校验会报"订单ID不能为空"
const confirmStatus = async () => {
  if (newStatus.value === null || newStatus.value === undefined) {
    ElMessage.warning('请选择新状态')
    return
  }
  if (currentOrderId.value === null || currentOrderId.value === undefined) {
    ElMessage.error('当前订单ID丢失，请重新点击改状态')
    return
  }

  await updateOrderStatus(currentOrderId.value, {
    orderId: currentOrderId.value,  // 关键：body 里必须传 orderId
    status: newStatus.value
  })
  ElMessage.success('状态修改成功')
  statusVisible.value = false
  loadData()
}

const handleCancel = async (row) => {
  const id = getOrderId(row)
  if (id === null || id === undefined) {
    ElMessage.error('订单ID无效，无法取消')
    console.log('当前行数据:', row)
    return
  }
  await ElMessageBox.confirm('确定取消该订单？', '提示', { type: 'warning' })
  await cancelOrder(id)
  ElMessage.success('订单已取消')
  loadData()
}

onMounted(loadData)
</script>
