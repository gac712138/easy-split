import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd'; 
import { useAuth } from '../context/AuthContext'; 

// Components
import LoadingScreen from '../components/LoadingScreen';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal'; // ★ 引入專用單按鈕彈窗
import ProjectPersonnelModal from '../components/ProjectPersonnelModal';
import ScrollObserver from '../components/ScrollObserver';

// Project Specific Components
import ProjectHeader from '../components/project/ProjectHeader';
import DebtOverviewCard from '../components/project/DebtOverviewCard';
import SettlementList from '../components/project/SettlementList';
import TransactionList from '../components/project/TransactionList';
import CheckSettlementModal from '../components/project/CheckSettlementModal';

const PAGE_SIZE = 10;

const ProjectDetailView = ({ 
  project, 
  onBack, 
  onAddTransaction, 
  onEditTransaction, 
  lastUpdated, 
  personnel = [], 
  onRefresh,
  setIsTypesEmpty 
}) => {
  const { user } = useAuth(); 
  const [transactions, setTransactions] = useState([]);
  const [settlements, setSettlements] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isSettlementLoading, setIsSettlementLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  const [isStartConfirmOpen, setIsStartConfirmOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false); 
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [checkingItem, setCheckingItem] = useState(null);

  // ★ 警告視窗控制狀態
  const [isCategoryWarningOpen, setIsCategoryWarningOpen] = useState(false);

  const isOwner = user?.id === project.user_id;

  // --- ★ 修正偵測邏輯：偵測擁有者的 categories 數量 ---
  useEffect(() => {
    const checkOwnerCategories = async () => {
      if (!project?.id || !project.user_id) return;
      try {
        const { count, error } = await supabase
          .from('categories') 
          .select('*', { count: 'exact', head: true })
          .eq('user_id', project.user_id);

        if (error) throw error;
        const isEmpty = (count === 0);
        if (setIsTypesEmpty) setIsTypesEmpty(isEmpty);

        // 如果為空，彈出 AlertModal
        if (isEmpty) {
          setIsCategoryWarningOpen(true);
        }
      } catch (err) {
        console.error('Check categories failed:', err);
      }
    };
    checkOwnerCategories();
  }, [project.id, project.user_id, setIsTypesEmpty]);

  const projectPersonnel = useMemo(() => {
    return personnel.filter(p => p.project_id === project.id);
  }, [personnel, project.id]);

  const getName = (id) => {
    const found = projectPersonnel.find(p => p.id === id);
    if (!found) return '未知成員';
    return found.linked_user_id === user?.id ? `${found.name} (你)` : found.name;
  };

  const fetchTransactions = useCallback(async (targetPage, isAppend = false) => {
    try {
      if (isAppend) setIsFetchingMore(true);
      const from = targetPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from('transactions')
        .select(`*, transaction_participants (personnel_id)`)
        .eq('project_id', project.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      if (isAppend) setTransactions(prev => [...prev, ...data]);
      else setTransactions(data || []);
      setHasMore((data || []).length === PAGE_SIZE);
    } catch (err) { console.error(err); }
    finally { setLoading(false); setIsFetchingMore(false); }
  }, [project.id]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchTransactions(0, false);
  }, [project.id, lastUpdated, fetchTransactions]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTransactions(nextPage, true);
  };

  // ... 結算與計算邏輯 (略，與你提供的代碼一致) ...
  useEffect(() => {
    if (project.status === 'settling' || project.status === 'archived') {
      const fetchSettlements = async () => {
        const { data } = await supabase.from('project_settlements').select('*').eq('project_id', project.id).order('is_cleared', { ascending: true });
        if (data) setSettlements(data);
      };
      fetchSettlements();
    }
  }, [project.id, project.status]);

  const calculatedSettlements = useMemo(() => {
    if (project.status !== 'active' || transactions.length === 0) return [];
    const balances = {}; 
    transactions.forEach(t => {
      const amount = Number(t.amount);
      const payerId = t.payer_id;
      if (!balances[payerId]) balances[payerId] = 0;
      balances[payerId] += amount;
      if (t.type === 'debt') {
        const debtorId = t.debtor_id;
        if (!balances[debtorId]) balances[debtorId] = 0;
        balances[debtorId] -= amount;
      } else if (t.type === 'advance') {
        const participants = t.transaction_participants || [];
        if (participants.length > 0) {
          const splitAmount = amount / participants.length;
          participants.forEach(p => {
            const pid = p.personnel_id;
            if (!balances[pid]) balances[pid] = 0;
            balances[pid] -= splitAmount;
          });
        }
      }
    });
    let debtors = []; let creditors = [];
    Object.entries(balances).forEach(([id, amount]) => {
      const val = Math.round(amount * 100) / 100;
      if (val < -0.01) debtors.push({ id, amount: val }); 
      if (val > 0.01) creditors.push({ id, amount: val }); 
    });
    debtors.sort((a, b) => a.amount - b.amount); 
    creditors.sort((a, b) => b.amount - a.amount); 
    const result = [];
    let i = 0; let j = 0; 
    while (i < debtors.length && j < creditors.length) {
      let debtor = debtors[i]; let creditor = creditors[j];
      let amount = Math.min(Math.abs(debtor.amount), creditor.amount);
      amount = Math.round(amount * 100) / 100;
      if (amount > 0) result.push({ from: debtor.id, to: creditor.id, amount: amount });
      debtor.amount += amount; creditor.amount -= amount;
      if (Math.abs(debtor.amount) < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }
    return result;
  }, [transactions, project.status]);

  const executeStartSettlement = async () => {
    setIsSettlementLoading(true);
    try {
      const payload = calculatedSettlements.map(item => ({ from: item.from, to: item.to, amount: Number(item.amount) }));
      const { error } = await supabase.rpc('start_project_settlement', { p_project_id: project.id, settlement_items: payload });
      if (error) throw error;
      message.success('已進入結算模式');
      setIsStartConfirmOpen(false); 
      if (onRefresh) await onRefresh(); 
    } catch (err) { message.error(err.message); }
    finally { setIsSettlementLoading(false); }
  };

  const executeCancelSettlement = async () => {
    setIsSettlementLoading(true);
    try {
      const { error } = await supabase.rpc('cancel_project_settlement', { p_project_id: project.id });
      if (error) throw error;
      message.success('已退回記帳模式');
      setIsCancelConfirmOpen(false);
      if (onRefresh) await onRefresh();
    } catch (err) { message.error('操作失敗'); }
    finally { setIsSettlementLoading(false); }
  };

  const executeArchiveProject = async () => {
    setIsSettlementLoading(true);
    try {
      const { error } = await supabase.rpc('archive_project', { p_project_id: project.id });
      if (error) throw error;
      message.success('專案已歸檔 🎉');
      setIsArchiveConfirmOpen(false);
      if (onRefresh) await onRefresh();
    } catch (err) { message.error(err.message); }
    finally { setIsSettlementLoading(false); }
  };

  const handleItemClick = async (item) => {
    if (item.is_cleared) {
      try {
        const { error } = await supabase.from('project_settlements').update({ is_cleared: false, remark: null }).eq('id', item.id);
        if (error) throw error;
        const { data } = await supabase.from('project_settlements').select('*').eq('project_id', project.id).order('is_cleared', { ascending: true });
        if(data) setSettlements(data);
      } catch (err) { message.error('操作失敗'); }
    } else {
      setCheckingItem(item);
      setIsCheckModalOpen(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      {isSettlementLoading && <LoadingScreen transparent={true} text="處理中..." />}
      
      {/* 這裡是詳情頁唯一的 Header */}
      <ProjectHeader 
        project={project} onBack={onBack} onOpenPersonnel={() => setIsPersonnelModalOpen(true)}
        onAddTransaction={onAddTransaction} personnel={projectPersonnel}
      />
      
      <main className="band-container" style={{ flex: 1, overflowY: 'auto', paddingBottom: '40px' }}>
        {project.status === 'active' && (
          <DebtOverviewCard calculatedSettlements={calculatedSettlements} isOwner={isOwner} onStartSettlement={() => setIsStartConfirmOpen(true)} getName={getName} />
        )}
        {(project.status === 'settling' || project.status === 'archived') && (
          <SettlementList project={project} settlements={settlements} isOwner={isOwner} onItemClick={handleItemClick} onCancel={() => setIsCancelConfirmOpen(true)} onFinish={() => setIsArchiveConfirmOpen(true)} getName={getName} />
        )}
        <TransactionList transactions={transactions} loading={loading} onEditTransaction={onEditTransaction} projectStatus={project.status} getName={getName} />
        {!loading && transactions.length > 0 && (
           <ScrollObserver onIntersect={handleLoadMore} hasMore={hasMore} loading={isFetchingMore} />
        )}
      </main>

      {/* ★ 警告視窗：使用專用單按鈕元件 */}
      <AlertModal
        isOpen={isCategoryWarningOpen}
        title="尚未設定款項類型"
        content={isOwner 
          ? "目前專案尚未設定任何款項類型（如：飲食、交通），這將導致您無法新增帳款。請點擊按鈕後，前往「系統設定 > 活動類型管理」進行添加。" 
          : "此專案尚未設定款項類型，請提醒專案擁有者（Owner）進行設定。"
        }
        onConfirm={() => setIsCategoryWarningOpen(false)}
        okText="我知道了"
      />

      {/* 其他 ConfirmModal 維持原樣 */}
      <ProjectPersonnelModal isOpen={isPersonnelModalOpen} onClose={() => setIsPersonnelModalOpen(false)} project={project} user={user} onRefresh={onRefresh} />
      <ConfirmModal open={isStartConfirmOpen} title="確定開始結算？" onConfirm={executeStartSettlement} content="進入結算模式後，將無法再新增或修改任何帳務。系統將鎖定目前的債務關係。" onCancel={() => setIsStartConfirmOpen(false)} loading={isSettlementLoading} />
      <ConfirmModal open={isCancelConfirmOpen} title="取消結算並回退？" onConfirm={executeCancelSettlement} content="這將會清空目前的勾選進度，並重新開放記帳功能。" onCancel={() => setIsCancelConfirmOpen(false)} loading={isSettlementLoading} />
      <ConfirmModal open={isArchiveConfirmOpen} title="確認完成並歸檔？" onConfirm={executeArchiveProject} content="歸檔後專案將變為唯讀狀態，無法再進行任何更動。" onCancel={() => setIsArchiveConfirmOpen(false)} loading={isSettlementLoading} okText="確認歸檔" />
      <CheckSettlementModal isOpen={isCheckModalOpen} onClose={() => setIsCheckModalOpen(false)} item={checkingItem} onRefresh={() => {
        const refetch = async () => {
          const { data } = await supabase.from('project_settlements').select('*').eq('project_id', project.id).order('is_cleared', { ascending: true });
          if(data) setSettlements(data);
        };
        refetch();
      }} getName={getName} />
    </div>
  );
};

export default ProjectDetailView;