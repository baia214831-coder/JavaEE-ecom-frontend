<<template>
  <div class="login-container">
    <el-card class="login-box">
      <h2>电商订单管理系统</h2>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="登录" name="login">
          <el-form :model="loginForm" label-width="0">
            <el-form-item>
              <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="User" />
            </el-form-item>
            <el-form-item>
              <el-input v-model="loginForm.password" placeholder="密码" type="password" prefix-icon="Lock" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" style="width:100%" @click="handleLogin">登录</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="注册" name="register">
          <el-form :model="registerForm" label-width="0">
            <el-form-item>
              <el-input v-model="registerForm.username" placeholder="用户名" />
            </el-form-item>
            <el-form-item>
              <el-input v-model="registerForm.password" placeholder="密码" type="password" />
            </el-form-item>
            <el-form-item>
              <el-input v-model="registerForm.confirmPassword" placeholder="确认密码" type="password" />
            </el-form-item>
            <el-form-item>
              <el-input v-model="registerForm.phone" placeholder="手机号" />
            </el-form-item>
            <el-form-item>
              <el-input v-model="registerForm.email" placeholder="邮箱" />
            </el-form-item>
            <el-form-item>
              <el-button type="success" style="width:100%" @click="handleRegister">注册</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/auth'
import { register } from '@/api/user'
import { useUserStore } from '@/stores/user'

const activeTab = ref('login')
const router = useRouter()
const userStore = useUserStore()

const loginForm = ref({ username: '', password: '' })
const registerForm = ref({ username: '', password: '', confirmPassword: '', phone: '', email: '' })

const handleLogin = async () => {
  try {
    // res 是 LoginResultVO：{ userId, username, token, expireTime, role, avatar, loginTime }
    const res = await login(loginForm.value)
    userStore.setUserInfo(res)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (e) {}
}

const handleRegister = async () => {
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  try {
    await register(registerForm.value)
    ElMessage.success('注册成功，请登录')
    activeTab.value = 'login'
  } catch (e) {}
}
</script>

<style scoped>
.login-container {
  height: 100vh; display: flex; justify-content: center; align-items: center;
  background: #f3f3f3;
}
.login-box { width: 400px; }
.login-box h2 { text-align: center; margin-bottom: 20px; }
</style>
