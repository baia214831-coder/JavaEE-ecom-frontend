<<template>
  <div>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>修改密码</span>
        </div>
      </template>
      <el-form :model="form" label-width="120px" style="max-width: 500px">
        <el-form-item label="旧密码">
          <el-input v-model="form.oldPassword" type="password" show-password placeholder="请输入旧密码" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="form.newPassword" type="password" show-password placeholder="请输入新密码（6-20位）" />
        </el-form-item>
        <el-form-item label="确认新密码">
          <el-input v-model="form.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">确认修改</el-button>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import {adminRequest} from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const handleSubmit = async () => {
  if (!form.value.oldPassword) {
    return ElMessage.warning('请输入旧密码')
  }
  if (!form.value.newPassword || form.value.newPassword.length < 6) {
    return ElMessage.warning('新密码长度不能少于6位')
  }
  if (form.value.newPassword !== form.value.confirmPassword) {
    return ElMessage.error('两次输入的新密码不一致')
  }

  const userId = userStore.userInfo?.userId
  if (!userId) {
    return ElMessage.error('用户信息异常，请重新登录')
  }

  try {
    await adminRequest.post('/user/password', {
      userId: userId,
      oldPassword: form.value.oldPassword,
      newPassword: form.value.newPassword
    })

    ElMessage.success('密码修改成功，请重新登录')
    // 实验要求：修改密码后强制下线（清除本地 Token 并跳转）
    setTimeout(() => {
      userStore.clearUser()
      window.location.href = '/login'
    }, 1500)
  } catch (e) {
    // 错误已在拦截器提示
  }
}

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.card-header {
  font-size: 16px;
  font-weight: bold;
}
</style>
