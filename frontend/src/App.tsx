import { useEffect, useState } from "react"
import { AppRoutes } from '@/routes/AppRoutes'
import { useAuthStore } from "@/store/authStore"
import { useSettingsStore } from "@/store/settingsStore"
import { applyTheme, initializeTheme, type ThemeName } from "@/theme.config"
import { getBaseCurrency } from "@/services/api/settings"
import BaseCurrencyModal from "@/components/BaseCurrencyModal"

// Initialize theme early to prevent flash
initializeTheme()

export default function App() {
  const fetchProfile = useAuthStore((s) => s.fetchProfile)
  const fetchSettings = useSettingsStore((s) => s.fetch)
  const settings = useSettingsStore((s) => s.settings)
  const [showBaseCurrencyModal, setShowBaseCurrencyModal] = useState(false)
  const [checkingBaseCurrency, setCheckingBaseCurrency] = useState(true)

  useEffect(() => {
    const initialize = async () => {
      await fetchProfile()
      await fetchSettings()
      
      // Check base currency
      try {
        const res = await getBaseCurrency()
        if (res.success && !res.data?.baseCurrency) {
          setShowBaseCurrencyModal(true)
        }
      } catch (error) {
        console.error("Error checking base currency:", error)
      } finally {
        setCheckingBaseCurrency(false)
      }
    }
    
    initialize()
  }, [])

  // Apply theme from settings when it changes
  useEffect(() => {
    if (settings.theme) {
      applyTheme(settings.theme as ThemeName)
    }
  }, [settings.theme])

  const handleBaseCurrencySuccess = () => {
    setShowBaseCurrencyModal(false)
    fetchSettings() // Refresh settings
  }

  if (checkingBaseCurrency) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <>
      <AppRoutes />
      <BaseCurrencyModal
        open={showBaseCurrencyModal}
        onClose={() => {}}
        onSuccess={handleBaseCurrencySuccess}
      />
    </>
  )
}
