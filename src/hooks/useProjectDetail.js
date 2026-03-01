import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAppStore } from '../store/appStore';

const PAGE_SIZE = 10;

export default function useProjectDetail(projectId, projectUserId, setIsTypesEmpty) {
  const [transactions, setTransactions] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  // 全域 store
  const setProjectPersonnel = useAppStore((s) => s.setProjectPersonnel);
  const setProjectCategories = useAppStore((s) => s.setProjectCategories);

  // 初始化/刷新資料
  const refreshData = useCallback(async (status = 'active') => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const tasks = [
        supabase.from('personnel').select('*').eq('project_id', projectId).order('sort_order', { ascending: true }),
        supabase.from('categories').select('*').eq('user_id', projectUserId).order('name'),
        supabase.from('transactions').select(`*, transaction_participants (personnel_id)`).eq('project_id', projectId).order('date', { ascending: false }).order('created_at', { ascending: false }).range(0, PAGE_SIZE - 1)
      ];
      if (status !== 'active') {
        tasks.push(supabase.from('project_settlements').select('*').eq('project_id', projectId).order('is_cleared', { ascending: true }));
      }
      const results = await Promise.all(tasks);
      const [persRes, catRes, txRes, setRes] = results;
      if (persRes.data) setProjectPersonnel(persRes.data);
      if (catRes.data) {
        setProjectCategories(catRes.data);
        if (setIsTypesEmpty) setIsTypesEmpty(catRes.data.length === 0);
      }
      if (txRes.data) {
        setTransactions(txRes.data);
        setHasMore(txRes.data.length === PAGE_SIZE);
      }
      if (setRes && setRes.data) setSettlements(setRes.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [projectId, projectUserId, setProjectPersonnel, setProjectCategories, setIsTypesEmpty]);

  // 分頁載入更多交易
  const fetchMoreTransactions = useCallback(async (targetPage) => {
    try {
      const from = targetPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase.from('transactions').select(`*, transaction_participants (personnel_id)`).eq('project_id', projectId).order('date', { ascending: false }).order('created_at', { ascending: false }).range(from, to);
      if (error) throw error;
      setTransactions((prev) => [...prev, ...(data || [])]);
      setHasMore((data || []).length === PAGE_SIZE);
      setPage(targetPage);
    } catch (err) {
      setError(err);
    }
  }, [projectId]);

  return {
    transactions,
    settlements,
    loading,
    error,
    hasMore,
    page,
    refreshData,
    fetchMoreTransactions,
  };
}
