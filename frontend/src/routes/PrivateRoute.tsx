import type { JSX } from 'react'
import { Navigate } from 'react-router-dom'

export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('onestore_token')
  return token ? children : <Navigate to="/login" />
}
