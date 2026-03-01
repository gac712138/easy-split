import { useCallback, useState } from 'react';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject
} from '../api/projectApi';

/**
 * 封裝專案相關的資料取得與操作邏輯
 * @param {string} userId
 * @param {number} pageSize
 */
export function useProjects(userId, pageSize = 10) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 取得專案列表
  const fetchProjects = useCallback(async (page = 0) => {
    setLoading(true);
    setError(null);
    const { data, error } = await getProjects(userId, page, pageSize);
    if (error) {
      setError(error);
    } else {
      setProjects(data || []);
      setHasMore((data?.length || 0) === pageSize);
      setPageIndex(page);
    }
    setLoading(false);
  }, [userId, pageSize]);

  // 建立新專案
  const handleCreate = useCallback(async (projectData) => {
    setLoading(true);
    setError(null);
    const { data, error } = await createProject(projectData);
    if (error) setError(error);
    else setProjects(prev => [data, ...prev]);
    setLoading(false);
    return { data, error };
  }, []);

  // 更新專案
  const handleUpdate = useCallback(async (projectId, updateData) => {
    setLoading(true);
    setError(null);
    const { data, error } = await updateProject(projectId, updateData);
    if (error) setError(error);
    else setProjects(prev => prev.map(p => p.id === projectId ? data : p));
    setLoading(false);
    return { data, error };
  }, []);

  // 刪除專案
  const handleDelete = useCallback(async (projectId) => {
    setLoading(true);
    setError(null);
    const { error } = await deleteProject(projectId);
    if (error) setError(error);
    else setProjects(prev => prev.filter(p => p.id !== projectId));
    setLoading(false);
    return { error };
  }, []);

  return {
    projects,
    loading,
    error,
    pageIndex,
    hasMore,
    fetchProjects,
    createProject: handleCreate,
    updateProject: handleUpdate,
    deleteProject: handleDelete,
    setPageIndex
  };
}
