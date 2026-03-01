import { supabase } from '../lib/supabaseClient';

/**
 * 取得指定使用者的專案（分頁）
 * @param {string} userId
 * @param {number} pageIndex
 * @param {number} pageSize
 * @returns {Promise<{ data: any, error: any }>}
 */
export async function getProjects(userId, pageIndex = 0, pageSize = 10, statusList = ['active', 'settling']) {
  const from = pageIndex * pageSize;
  const to = from + pageSize - 1;
  // 內連 project_members，查詢所有 userId 參與的專案
  let query = supabase
    .from('projects')
    .select('*, project_members!inner(*)')
    .eq('project_members.user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  // 狀態過濾邏輯
  if (Array.isArray(statusList) && statusList.length > 0) {
    const lowered = statusList.map(s => typeof s === 'string' ? s.toLowerCase() : s);
    query = query.in('status', lowered);
  }

  const { data, error } = await query;
  return { data, error };
}

/**
 * 建立新專案
 * @param {object} projectData
 * @returns {Promise<{ data: any, error: any }>}
 */
export async function createProject(projectData) {
  const { data, error } = await supabase
    .from('projects')
    .insert([projectData])
    .select()
    .single();
  return { data, error };
}

/**
 * 更新專案
 * @param {string} projectId
 * @param {object} updateData
 * @returns {Promise<{ data: any, error: any }>}
 */
export async function updateProject(projectId, updateData) {
  const { data, error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', projectId)
    .select()
    .single();
  return { data, error };
}

/**
 * 刪除專案
 * @param {string} projectId
 * @returns {Promise<{ data: any, error: any }>}
 */
export async function deleteProject(projectId) {
  const { data, error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);
  return { data, error };
}
