import { create } from 'zustand';
import { getProjects } from '../api/projectApi';

const PROJECT_PAGE_SIZE = 10;

export const useProjectsStore = create((set, get) => ({
  projects: [],
  loading: false,
  error: null,
  hasMore: true,
  page: 0,

  // 取得專案列表
  fetchProjects: async (userId, isReset = false, statusList = null) => {
    if (!userId) return;
    const PAGE_SIZE = 10;
    let newPage = isReset ? 0 : get().page + 1;
    if (isReset) {
      set({ projects: [], page: 0, hasMore: true, loading: true, error: null });
      newPage = 0;
    } else {
      set({ loading: true, error: null });
    }
    try {
      const { data, error } = await getProjects(userId, newPage, PAGE_SIZE, statusList);
      if (error) {
        set({ loading: false, error });
        return;
      }
      const safeData = Array.isArray(data) ? data : [];
      console.log('專案資料:', safeData);
      set(state => {
        const merged = isReset ? safeData : [...(state.projects || []), ...safeData];
        return {
          projects: merged,
          hasMore: safeData.length === PAGE_SIZE,
          page: newPage,
          loading: false,
          error: null,
        };
      });
    } catch (err) {
      set({ loading: false, error: err });
    }
  },

  // 新增專案
  addProject: (newProject) =>
    set(state => ({ projects: [newProject, ...state.projects] })),

  // 移除專案
  removeProject: (projectId) =>
    set(state => ({ projects: state.projects.filter(p => p.id !== projectId) })),

  // 更新專案
  updateProject: (updatedProject) =>
    set(state => ({
      projects: state.projects.map(p => p.id === updatedProject.id ? updatedProject : p)
    })),
}));
