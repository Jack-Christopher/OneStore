import { useEffect } from "react"
import { AppRoutes } from '@/routes/AppRoutes'
import { useAuthStore } from "@/store/authStore"
import { useSettingsStore } from "@/store/settingsStore"
import { applyTheme, initializeTheme, type ThemeName } from "@/theme.config"

// Initialize theme early to prevent flash
initializeTheme()

export default function App() {
  const fetchProfile = useAuthStore((s) => s.fetchProfile)
  const fetchSettings = useSettingsStore((s) => s.fetch)
  const settings = useSettingsStore((s) => s.settings)

  useEffect(() => {
    fetchProfile()
    fetchSettings()
  }, [])

  // Apply theme from settings when it changes
  useEffect(() => {
    if (settings.theme) {
      applyTheme(settings.theme as ThemeName)
    }
  }, [settings.theme])

  return <AppRoutes />
}
