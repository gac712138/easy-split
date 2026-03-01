import { useState, useCallback } from 'react';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../api/transactionApi';

/**
 * 交易資料 hook
 * @param {string} projectId
 */
export function useTransactions(projectId) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 取得交易列表
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await getTransactions(projectId);
    if (error) setError(error);
    setTransactions(data || []);
    setLoading(false);
  }, [projectId]);

  // 新增交易
  const addTransaction = useCallback(async (txData) => {
    setLoading(true);
    setError(null);
    const { data, error } = await createTransaction(txData);
    if (error) setError(error);
    else setTransactions(prev => [data, ...prev]);
    setLoading(false);
    return { data, error };
  }, []);

  // 編輯交易
  const editTransaction = useCallback(async (transactionId, txData) => {
    setLoading(true);
    setError(null);
    const { data, error } = await updateTransaction(transactionId, txData);
    if (error) setError(error);
    else setTransactions(prev => prev.map(tx => tx.id === transactionId ? data : tx));
    setLoading(false);
    return { data, error };
  }, []);

  // 刪除交易
  const removeTransaction = useCallback(async (transactionId) => {
    setLoading(true);
    setError(null);
    const { error } = await deleteTransaction(transactionId);
    if (error) setError(error);
    else setTransactions(prev => prev.filter(tx => tx.id !== transactionId));
    setLoading(false);
    return { error };
  }, []);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    editTransaction,
    removeTransaction
  };
}
