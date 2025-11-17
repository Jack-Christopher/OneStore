import { useEffect } from "react"
import { AppRoutes } from '@/routes/AppRoutes'
import { useAuthStore } from "@/store/authStore"

export default function App() {
  const fetchProfile = useAuthStore((s) => s.fetchProfile)

  useEffect(() => {
    fetchProfile()
  }, [])

  return <AppRoutes />
}
