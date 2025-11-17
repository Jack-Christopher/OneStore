import axios from "axios"
import { useAuthStore } from "@/store/authStore"

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

instance.interceptors.request.use((config: any) => {
  const token = useAuthStore.getState().authUser?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default instance
