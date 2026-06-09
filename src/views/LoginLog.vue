<<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>登录日志</span>
        </div>
      </template>
      <el-table :data="logList" border v-loading="loading">
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
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { adminRequest} from '@/utils/request'

const userStore = useUserStore()
const loading = ref(false)
const logList = ref([])

const loadLogs = async () => {
  loading.value = true
  try {
    const userId = userStore.userInfo?.userId
    if (userId) {
      const res = await request.get(`/user/loginLogs/${userId}`)
      logList.value = res || []
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadLogs)
</script>

<style scoped>
.card-header {
  font-size: 16px;
  font-weight: bold;
}
</style>
