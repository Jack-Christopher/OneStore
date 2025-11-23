import api from "@/services/lib/axios"
import type { ApiResponse } from "@/types/api"

const AUTH_API_BASE = "/api/auth"

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  fullname: string
  email: string
  password: string
}

export interface User {
  id: string
  tenantId: string
  fullname: string
  email: string
  role: string
  isActive: boolean
}

export interface AuthUser {
  user: User
  token: string
}

export function toUser(dto: RegisterPayload) {
  const registerUser = {
    tenantId: "orphan",
    fullname: dto.fullname,
    username: dto.fullname,
    email: dto.email,
    password: dto.password,
    role: "clerk",
    isActive: true,
  }
  return registerUser;
}

export async function login(payload: LoginPayload) {
  const res = await api.post<ApiResponse<AuthUser>>(`${AUTH_API_BASE}/login`, payload);
  return res.data;
}

export async function register(payload: RegisterPayload) {
  const completePayload = toUser(payload);
  const res = await api.post<ApiResponse<AuthUser>>(`${AUTH_API_BASE}/register`, completePayload);
  return res.data
}

export async function getProfile() {
  const res = await api.get<ApiResponse<AuthUser>>(`${AUTH_API_BASE}/profile`);
  return res.data;
}
