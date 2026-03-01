import { supabase } from '../lib/supabaseClient';

/**
 * 取得指定專案的所有交易（含參與人員）
 * @param {string} projectId
 * @returns {Promise<{ data: any, error: any }>}
 */
export async function getTransactions(projectId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, transaction_participants (personnel_id)')
    .eq('project_id', projectId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });
  return { data, error };
}

/**
 * 建立新交易
 * @param {object} data
 * @returns {Promise<{ data: any, error: any }>}
 */
export async function createTransaction(data) {
  const { data: result, error } = await supabase
    .from('transactions')
    .insert([data])
    .select()
    .single();
  return { data: result, error };
}

/**
 * 更新交易
 * @param {string} transactionId
 * @param {object} data
 * @returns {Promise<{ data: any, error: any }>}
 */
export async function updateTransaction(transactionId, data) {
  const { data: result, error } = await supabase
    .from('transactions')
    .update(data)
    .eq('id', transactionId)
    .select()
    .single();
  return { data: result, error };
}

/**
 * 刪除交易
 * @param {string} transactionId
 * @returns {Promise<{ data: any, error: any }>}
 */
export async function deleteTransaction(transactionId) {
  const { data, error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId);
  return { data, error };
}
