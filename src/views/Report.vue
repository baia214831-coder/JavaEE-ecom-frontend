<<template>
  <div>
    <el-row :gutter="20">
      <!-- 一对一查询 -->
      <el-col :span="12">
        <el-card>
          <template #header>一对一：用户 + 扩展信息</template>
          <el-input v-model="userId1" placeholder="输入用户ID" style="width:200px;margin-right:10px" />
          <el-button type="primary" @click="queryProfile">查询</el-button>
          <div v-if="profileData" style="margin-top:15px">
            <p><strong>用户名：</strong>{{ profileData.username || profileData.user?.username || '-' }}</p>
            <p><strong>真实姓名：</strong>{{ profileData.realName || profileData.profile?.realName || '-' }}</p>
            <p><strong>性别：</strong>{{ profileData.gender || profileData.profile?.gender || '-' }}</p>
            <p><strong>手机号：</strong>{{ profileData.phone || profileData.profile?.phone || '-' }}</p>
            <p><strong>邮箱：</strong>{{ profileData.email || profileData.profile?.email || '-' }}</p>
          </div>
        </el-card>
      </el-col>

      <!-- 一对多查询 -->
      <el-col :span="12">
        <el-card>
          <template #header>一对多：用户 + 订单列表</template>
          <el-input v-model="userId2" placeholder="输入用户ID" style="width:200px;margin-right:10px" />
          <el-button type="primary" @click="queryUserOrders">查询</el-button>
          <el-table :data="userOrdersData" style="margin-top:15px" border size="small" v-if="userOrdersData.length > 0">
            <el-table-column prop="orderNo" label="订单号" />
            <el-table-column label="金额">
              <template #default="{ row }">
                ¥{{ row.totalAmount || row.totalPrice || row.total_price || 0 }}
              </template>
            </el-table-column>
            <el-table-column label="状态">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无数据" style="margin-top:15px" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top:20px">
      <!-- 多对多查询 -->
      <el-col :span="12">
        <el-card>
          <template #header>多对多：订单 + 商品明细</template>
          <el-input v-model="orderId" placeholder="输入订单ID" style="width:200px;margin-right:10px" />
          <el-button type="primary" @click="queryOrderProducts">查询</el-button>
          <el-table :data="orderProducts" style="margin-top:15px" border size="small" v-if="orderProducts.length > 0">
            <el-table-column prop="productName" label="商品" />
            <el-table-column prop="quantity" label="数量" />
            <el-table-column label="单价">
              <template #default="{ row }">
                ¥{{ row.unitPrice || row.price || 0 }}
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无数据" style="margin-top:15px" />
        </el-card>
      </el-col>

      <!-- 复杂分页查询 -->
      <el-col :span="12">
        <el-card>
          <template #header>复杂条件分页查询</template>
          <el-select v-model="reportQuery.status" placeholder="状态" clearable style="width:120px;margin-right:10px">
            <el-option label="待支付" :value="0" />
            <el-option label="已支付" :value="1" />
            <el-option label="已发货" :value="2" />
            <el-option label="已完成" :value="3" />
            <el-option label="已取消" :value="4" />
          </el-select>
          <el-button type="primary" @click="queryReportPage">查询</el-button>
          <el-table :data="reportPage.list" style="margin-top:15px" border size="small" v-if="reportPage.list.length > 0">
            <el-table-column label="ID">
              <template #default="{ row }">
                {{ row.id || row.orderId || '-' }}
              </template>
            </el-table-column>
            <el-table-column prop="orderNo" label="订单号" />
            <el-table-column label="状态">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="暂无数据" style="margin-top:15px" />
          <el-pagination
            v-if="reportPage.total > 0"
            v-model:current-page="reportQuery.page"
            v-model:page-size="reportQuery.size"
            :total="reportPage.total"
            layout="total, prev, pager, next"
            style="margin-top:10px"
            @change="queryReportPage"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserWithProfile, getUserWithOrders, getOrderWithProducts, getOrderReportPage } from '@/api/report'

const statusMap = {
  0: { text: '待支付', type: 'info' },
  1: { text: '已支付', type: 'success' },
  2: { text: '已发货', type: 'warning' },
  3: { text: '已完成', type: 'success' },
  4: { text: '已取消', type: 'danger' }
}

const statusText = (s) => statusMap[s]?.text || s
const statusType = (s) => statusMap[s]?.type || ''

// 一对一
const userId1 = ref('')
const profileData = ref(null)
const queryProfile = async () => {
  if (!userId1.value) {
    ElMessage.warning('请输入用户ID')
    return
  }
  try {
    const res = await getUserWithProfile(userId1.value)
    console.log('一对一返回:', res)
    profileData.value = res
  } catch (e) {
    profileData.value = null
  }
}

// 一对多
const userId2 = ref('')
const userOrdersData = ref([])
const queryUserOrders = async () => {
  if (!userId2.value) {
    ElMessage.warning('请输入用户ID')
    return
  }
  try {
    const res = await getUserWithOrders(userId2.value)
    console.log('一对多返回:', res)
    // 兼容多种返回结构
    userOrdersData.value = res?.orders || res?.orderList || res?.list || []
  } catch (e) {
    userOrdersData.value = []
  }
}

// 多对多
const orderId = ref('')
const orderProducts = ref([])
const queryOrderProducts = async () => {
  if (!orderId.value) {
    ElMessage.warning('请输入订单ID')
    return
  }
  try {
    const res = await getOrderWithProducts(orderId.value)
    console.log('多对多返回:', res)
    // 兼容多种返回结构
    orderProducts.value = res?.products || res?.items || res?.productList || []
  } catch (e) {
    orderProducts.value = []
  }
}

// 复杂分页查询
const reportQuery = ref({ page: 1, size: 5, status: null })
const reportPage = ref({ list: [], total: 0 })
const queryReportPage = async () => {
  try {
    const res = await getOrderReportPage(reportQuery.value)
    console.log('分页返回:', res)
    // 兼容 PageResult 的不同字段名
    reportPage.value = {
      list: res?.list || res?.records || [],
      total: res?.total || res?.totalCount || 0
    }
  } catch (e) {
    reportPage.value = { list: [], total: 0 }
  }
}
</script>
