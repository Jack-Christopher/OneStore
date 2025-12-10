import { create } from "zustand";
import { getSettings, updateSettings, uploadLogo } from "@/services/api/settings";
import type { Settings, UpdateSettingsPayload } from "@/services/api/settings";

interface SettingsState {
  settings: Settings;
  loading: boolean;
  error: string | null;

  fetch: () => Promise<void>;
  update: (data: UpdateSettingsPayload) => Promise<void>;
  uploadLogoFile: (file: File) => Promise<string | null>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {},
  loading: false,
  error: null,

  fetch: async () => {
    try {
      set({ loading: true, error: null });
      const res = await getSettings();
      if (res.success) {
        const newSettings = res.data || {};
        set({ settings: newSettings });
        
        // Don't apply theme from settings - theme is controlled by ThemeToggle and localStorage
        // Theme is applied on app initialization from localStorage in main.tsx
      } else {
        set({ error: res.message || "Error fetching settings" });
      }
    } catch (error: any) {
      set({ error: error.message || "Error fetching settings" });
    } finally {
      set({ loading: false });
    }
  },

  update: async (payload) => {
    try {
      set({ loading: true, error: null });
      const res = await updateSettings(payload);
      if (res.success && res.data) {
        const updatedSettings = { ...get().settings, ...res.data };
        set({ settings: updatedSettings });
        
        // Don't apply theme from settings update - theme is controlled by ThemeToggle
      } else {
        set({ error: res.message || "Error updating settings" });
      }
    } catch (error: any) {
      set({ error: error.message || "Error updating settings" });
    } finally {
      set({ loading: false });
    }
  },

  uploadLogoFile: async (file) => {
    try {
      set({ loading: true, error: null });
      const res = await uploadLogo(file);
      if (res.success && res.data) {
        set({ settings: { ...get().settings, store_logo_path: res.data.path } });
        return res.data.path;
      } else {
        set({ error: res.message || "Error uploading logo" });
        return null;
      }
    } catch (error: any) {
      set({ error: error.message || "Error uploading logo" });
      return null;
    } finally {
      set({ loading: false });
    }
  },
}));
