import { useUserStore } from '@/stores/user'

export const permission = {
  mounted(el, binding) {
    const userStore = useUserStore()
    const required = binding.value
    if (!required) return

    const has = userStore.hasPermission(required)
    if (!has) {
      el.parentNode?.removeChild(el)
    }
  }
}
