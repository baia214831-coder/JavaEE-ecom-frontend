<<template>
  <div>
    <el-card>
      <div style="margin-bottom:15px">
        <el-input v-model="query.username" placeholder="用户名" style="width:200px;margin-right:10px" clearable />
        <el-input v-model="query.phone" placeholder="手机号" style="width:200px;margin-right:10px" clearable />
        <el-button type="primary" @click="loadData">查询</el-button>
      </div>
      <el-table :data="tableData" border v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="email" label="邮箱" />
        <<el-table-column label="状态" width="90">
           <template #default="{ row }">
             <el-tag :type="(row.enabled === false) ? 'danger' : 'success'">
               {{ (row.enabled === false) ? '禁用' : '启用' }}
             </el-tag>
           </template>
         </el-table-column>

        <<el-table-column label="锁定" width="90">
          <template #default="{ row }">
            <el-tag :type="(row.accountNonLocked === false) ? 'warning' : 'success'">
              {{ (row.accountNonLocked === false) ? '已锁定' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>

        <<el-table-column prop="failCount" label="失败次数" width="90" />
        <el-table-column prop="lastLoginTime" label="最后登录" min-width="160" />
        <el-table-column label="操作" width="420" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editUser(row)">编辑</el-button>
            <el-button size="small" type="info" @click="viewProfile(row.id)">扩展</el-button>
            <el-button size="small" type="primary" @click="viewOrders(row.id)">订单</el-button>
            <el-button
              v-if="row.accountNonLocked"
              size="small"
              type="warning"
              @click="handleLock(row)"
              :disabled="!hasManagePermission"
            >锁定</el-button>
            <el-button
              v-else
              size="small"
              type="success"
              @click="handleUnlock(row)"
              :disabled="!hasManagePermission"
            >解锁</el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleResetPwd(row)"
              :disabled="!hasManagePermission"
            >重置密码</el-button>
            <el-button
              size="small"
              @click="viewLogs(row.id)"
              :disabled="!hasManagePermission"
            >日志</el-button>
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

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editVisible" title="编辑用户" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="editForm.realName" />
        </el-form-item>
        <el-form-item label="收货地址">
          <el-input v-model="editForm.address" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 扩展信息弹窗 -->
    <el-dialog v-model="profileVisible" title="用户扩展信息（一对一）" width="500px">
      <div v-if="profile">
        <p>用户名：{{ profile.username }}</p>
        <p>真实姓名：{{ profile.realName }}</p>
        <p>性别：{{ profile.gender }}</p>
        <p>地址：{{ profile.address }}</p>
      </div>
    </el-dialog>

    <!-- 订单弹窗 -->
    <el-dialog v-model="ordersVisible" title="用户订单列表（一对多）" width="700px">
      <el-table :data="userOrders" border>
        <el-table-column prop="id" label="订单ID" />
        <el-table-column prop="orderNo" label="订单号" />
        <el-table-column prop="totalAmount" label="金额" />
        <el-table-column prop="status" label="状态" />
      </el-table>
    </el-dialog>

    <!-- 登录日志弹窗 -->
    <el-dialog v-model="logsVisible" title="登录日志" width="700px">
      <el-table :data="loginLogs" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="loginTime" label="登录时间" min-width="160" />
        <el-table-column prop="ip" label="IP地址" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import {adminRequest} from '@/utils/request'
import { getUserPage, updateUser, getUserProfile, getUserOrders } from '@/api/user'

const userStore = useUserStore()
const loading = ref(false)
const query = ref({ pageNum: 1, pageSize: 10, username: '', phone: '' })
const tableData = ref([])
const total = ref(0)

const editVisible = ref(false)
const editForm = ref({ id: null, phone: '', email: '' })
const profileVisible = ref(false)
const profile = ref(null)
const ordersVisible = ref(false)
const userOrders = ref([])
const logsVisible = ref(false)
const loginLogs = ref([])

// 判断是否有 order:manage 权限（后端 UserSecurityController 用的权限标识）
const hasManagePermission = computed(() => {
  return userStore.hasPermission('order:manage') || userStore.isAdmin
})

const loadData = async () => {
  loading.value = true
  const res = await getUserPage(query.value)
  tableData.value = res.records || []
  total.value = res.total || 0
  loading.value = false
}

const editUser = (row) => {
  editForm.value = {
    id: row.id,
    username: row.username,
    phone: row.phone || '',
    email: row.email || '',
    realName: row.realName || '',
    address: row.address || ''
  }
  editVisible.value = true
}

const submitEdit = async () => {
  await updateUser(editForm.value.id, editForm.value)
  ElMessage.success('修改成功')
  editVisible.value = false
  loadData()
}

const viewProfile = async (id) => {
  profile.value = await getUserProfile(id)
  profileVisible.value = true
}

const viewOrders = async (id) => {
  userOrders.value = await getUserOrders(id)
  ordersVisible.value = true
}

// 锁定账户
const handleLock = async (row) => {
  try {
    await ElMessageBox.confirm(`确定锁定用户 ${row.username} 的账户吗？`, '提示', { type: 'warning' })
    await adminRequest.post(`/user/lock/${row.id}`)
    ElMessage.success('账户已锁定')
    loadData()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

// 解锁账户
const handleUnlock = async (row) => {
  try {
    await ElMessageBox.confirm(`确定解锁用户 ${row.username} 的账户吗？`, '提示', { type: 'warning' })
    await adminRequest.post(`/user/unlock/${row.id}`)
    ElMessage.success('账户已解锁')
    loadData()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

// 重置密码（管理员功能）
const handleResetPwd = async (row) => {
  try {
    const { value } = await ElMessageBox.prompt(`请输入用户 ${row.username} 的新密码`, '重置密码', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^.{6,20}$/,
      inputErrorMessage: '密码长度应为6-20位'
    })
    await adminRequest.post('/user/resetPassword', {
      userId: row.id,
      newPassword: value
    })
    ElMessage.success('密码重置成功')
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

// 查看登录日志
const viewLogs = async (id) => {
  try {
    const res = await adminRequest.get(`/user/loginLogs/${id}`)
    loginLogs.value = res || []
    logsVisible.value = true
  } catch (e) {
    console.error(e)
  }
}

onMounted(loadData)
</script>
