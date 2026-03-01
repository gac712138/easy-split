import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // 1. 使用者資訊
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),

  // 2. 佈景主題
  theme: 'light',
  setTheme: (theme) => set({ theme }),

  // 3. 全域 Loading 狀態
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),

  // 4. 目前正在查看的專案
  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),
  clearCurrentProject: () => set({
    currentProject: null,
    projectPersonnel: [],
    projectCategories: [],
  }),

  // 5. 專案成員名單
  projectPersonnel: [],
  setProjectPersonnel: (personnel) => set({ projectPersonnel: personnel }),

  // 6. 專案分類
  projectCategories: [],
  setProjectCategories: (categories) => set({ projectCategories: categories }),
}));
