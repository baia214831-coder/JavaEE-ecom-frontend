<<template>
  <div>
    <el-card>
      <div style="margin-bottom:15px">
        <el-input v-model="query.username" placeholder="用户名" style="width:200px;margin-right:10px" clearable />
        <el-input v-model="query.phone" placeholder="手机号" style="width:200px;margin-right:10px" clearable />
        <el-button type="primary" @click="loadData">查询</el-button>
      </div>

      <el-table :data="tableData" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <el-button size="small" @click="editUser(row)">编辑</el-button>
            <el-button size="small" type="info" @click="viewProfile(row.id)">扩展信息</el-button>
            <el-button size="small" type="primary" @click="viewOrders(row.id)">查看订单</el-button>
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

    <el-dialog v-model="editVisible" title="编辑用户" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" />
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

    <el-dialog v-model="profileVisible" title="用户扩展信息（一对一）" width="500px">
      <div v-if="profile">
        <p>用户名：{{ profile.username }}</p>
        <p>真实姓名：{{ profile.realName }}</p>
        <p>性别：{{ profile.gender }}</p>
        <p>地址：{{ profile.address }}</p>
      </div>
    </el-dialog>

    <el-dialog v-model="ordersVisible" title="用户订单列表（一对多）" width="700px">
      <el-table :data="userOrders" border>
        <el-table-column prop="id" label="订单ID" />
        <el-table-column prop="orderNo" label="订单号" />
        <el-table-column prop="totalAmount" label="金额" />
        <el-table-column prop="status" label="状态" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserPage, updateUser, getUserProfile, getUserOrders } from '@/api/user'

const query = ref({ pageNum: 1, pageSize: 10, username: '', phone: '' })
const tableData = ref([])
const total = ref(0)

const editVisible = ref(false)
const editForm = ref({ id: null, phone: '', email: '' })

const profileVisible = ref(false)
const profile = ref(null)

const ordersVisible = ref(false)
const userOrders = ref([])

const loadData = async () => {
  const res = await getUserPage(query.value)
  tableData.value = res.records
  total.value = res.total
}

const editUser = (row) => {
  editForm.value = {
    id: row.id,
    username: row.username,
    phone: row.phone,
    email: row.email,
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

onMounted(loadData)
</script>
