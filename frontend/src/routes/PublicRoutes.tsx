import type { JSX } from 'react'
import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"

export const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const user = useAuthStore((s) => s.authUser)
  const hasHydrated = useAuthStore.persist.hasHydrated()

  if (!hasHydrated) return null

  if (user) return <Navigate to="/" />

  return children
}
