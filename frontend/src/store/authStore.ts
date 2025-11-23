import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { login, register, getProfile } from "@/services/api/auth"
import type { AuthUser, LoginPayload, RegisterPayload } from "@/services/api/auth"

interface AuthState {
  authUser: AuthUser | null
  setUser: (u: AuthUser | null) => void
  loading: boolean

  loginUser: (payload: LoginPayload) => Promise<void>
  registerUser: (payload: RegisterPayload) => Promise<void>
  fetchProfile: () => Promise<void>
  logout: () => void
};


export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authUser: null,
      setUser: (u) => set({ authUser: u }),
      loading: false,

      loginUser: async (payload) => {
        set({ loading: true })
        const res = await login(payload)

        if (res.success && res.data) {
          set({ authUser: res.data })
        }

        set({ loading: false })
      },

      registerUser: async (payload: RegisterPayload) => {
        set({ loading: true })
        const res = await register(payload)

        if (res.success && res.data) {
          set({ authUser: res.data })
        }

        set({ loading: false })
      },

      fetchProfile: async () => {
        if (!useAuthStore.getState().authUser?.token) return;

        try {
          const res = await getProfile();
          if (res.success && res.data) set({ authUser: res.data });
        } catch {
          set({ authUser: null });
          useAuthStore.persist.clearStorage();
        }
      },

      logout: () => {
        set({ authUser: null });
        useAuthStore.persist.clearStorage();
      }
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)