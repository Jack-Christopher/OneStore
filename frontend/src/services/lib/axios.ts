import axios from "axios"
import { useAuthStore } from "@/store/authStore"
import { parseApiError } from "@/utils/errorHandler"

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

instance.interceptors.request.use((config: any) => {
  const token = useAuthStore.getState().authUser?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor to handle errors globally
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Parse the error to get a user-friendly message
    const parsedError = parseApiError(error, error.config?.url);
    
    // Attach parsed error to the error object for easy access
    error.parsedError = parsedError;
    error.userMessage = parsedError.message;
    error.errorCode = parsedError.code;
    
    return Promise.reject(error);
  }
)

export default instance
