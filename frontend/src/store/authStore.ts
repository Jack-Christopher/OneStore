import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { login, register, getProfile, updateProfile } from "@/services/api/auth"
import type { AuthUser, LoginPayload, RegisterPayload, UpdateProfilePayload } from "@/services/api/auth"

interface AuthState {
  authUser: AuthUser | null
  setUser: (u: AuthUser | null) => void
  loading: boolean

  loginUser: (payload: LoginPayload) => Promise<void>
  registerUser: (payload: RegisterPayload) => Promise<void>
  fetchProfile: () => Promise<void>
  updateUserProfile: (payload: UpdateProfilePayload) => Promise<void>
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

      updateUserProfile: async (payload: UpdateProfilePayload) => {
        set({ loading: true });
        try {
          const res = await updateProfile(payload);
          if (res.success && res.data) {
            set({ authUser: res.data });
          }
        } catch (error) {
          console.error("Error updating profile:", error);
          throw error;
        } finally {
          set({ loading: false });
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