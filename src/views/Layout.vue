<<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <div class="logo">电商订单系统</div>
      <el-menu
        :default-active="$route.path"
        router
        background-color="#304156"
        text-color="#fff"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/products">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><List /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/users" v-if="userStore.isAdmin || userStore.isManager">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/cart">
          <el-icon><ShoppingCart /></el-icon>
          <span>购物车</span>
        </el-menu-item>
        <el-menu-item index="/report">
          <el-icon><DataLine /></el-icon>
          <span>关联查询报表</span>
        </el-menu-item>
        <el-menu-item index="/loginLogs" v-if="userStore.isAdmin || userStore.isManager">
          <el-icon><Document /></el-icon>
          <span>登录日志</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <div class="header-right">
          <el-tag v-if="userStore.role" :type="roleTagType" size="small">{{ roleText }}</el-tag>
          <span v-if="userStore.userInfo">{{ userStore.userInfo.username }}</span>
          <el-button type="primary" size="small" @click="goPassword">修改密码</el-button>
          <el-button type="danger" size="small" @click="logout">退出</el-button>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const userStore = useUserStore()
const router = useRouter()

const roleText = computed(() => {
  const map = {
    'ROLE_ADMIN': '超级管理员',
    'ROLE_MANAGER': '管理员',
    'ROLE_USER': '普通用户'
  }
  return map[userStore.role] || userStore.role
})

const roleTagType = computed(() => {
  if (userStore.role === 'ROLE_ADMIN') return 'danger'
  if (userStore.role === 'ROLE_MANAGER') return 'warning'
  return 'info'
})

const goPassword = () => {
  router.push('/password')
}

const logout = async () => {
  try {
    // 必须调用后端，删除 Redis 中的 Token
    await request.post('/auth/logout')
  } catch (e) {
    console.error('登出接口调用失败', e)
  } finally {
    // 无论后端是否成功，前端必须清本地缓存
    userStore.clearUser()
    window.location.href = '/login'
  }
}
</script>

<style scoped>
.layout-container { height: 100vh; }
.logo {
  height: 60px; line-height: 60px; text-align: center;
  color: #fff; font-size: 18px; font-weight: bold;
  background: #2b3649;
}
.el-aside { background: #304156; }
.el-header {
  background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  display: flex; align-items: center; justify-content: flex-end;
}
.header-right { display: flex; align-items: center; gap: 12px; }
</style>
