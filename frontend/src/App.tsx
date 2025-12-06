import { useEffect } from "react"
import { AppRoutes } from '@/routes/AppRoutes'
import { useAuthStore } from "@/store/authStore"
import { useSettingsStore } from "@/store/settingsStore"

export default function App() {
  const fetchProfile = useAuthStore((s) => s.fetchProfile)
  const fetchSettings = useSettingsStore((s) => s.fetch)
  const settings = useSettingsStore((s) => s.settings)

  useEffect(() => {
    fetchProfile()
    fetchSettings()
  }, [])

  // Apply theme from settings
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.theme])

  return <AppRoutes />
}
