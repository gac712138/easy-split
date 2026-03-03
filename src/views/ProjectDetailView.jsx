import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd'; 
import { useAuth } from '../context/AuthContext'; 

// Components
import LoadingScreen from '../components/LoadingScreen';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal'; 
import ProjectPersonnelModal from '../components/ProjectPersonnelModal';
import ScrollObserver from '../components/ScrollObserver';
import AddTransactionModal from '../components/AddTransactionModal';

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
  lastUpdated, 
  onRefresh,
  setIsTypesEmpty 
}) => {
  const { user } = useAuth(); 
  
  // ★ 核心 1：狀態初始化與安全防護
  const [currentStatus, setCurrentStatus] = useState(project?.status || 'active');
  const [transactions, setTransactions] = useState([]);
  const [settlements, setSettlements] = useState([]); 
  const [localPersonnel, setLocalPersonnel] = useState([]); 
  const [localCategories, setLocalCategories] = useState([]); 

  const [loading, setLoading] = useState(true); 
  const [isSettlementLoading, setIsSettlementLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [isStartConfirmOpen, setIsStartConfirmOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false); 
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [checkingItem, setCheckingItem] = useState(null);
  const [isCategoryWarningOpen, setIsCategoryWarningOpen] = useState(false);

  const isOwner = user?.id && project?.user_id ? user.id === project.user_id : false;

  // ★ 核心 2：人員紅點即時判斷 (人數 <= 1 則顯示)
  const showPersonnelBadge = localPersonnel.length <= 1;

  // 同步專案狀態
  useEffect(() => {
    if (project?.status) setCurrentStatus(project.status);
  }, [project?.status]);

  // --- 核心 A：全量初始化 (同步抓取成員、類別、帳務) ---
  const initProjectData = useCallback(async () => {
    if (!project?.id) return;
    setLoading(true); 
    
    try {
      const tasks = [
        // 任務 1: 抓取該專案成員 (Dropdown 來源)
        supabase.from('personnel').select('*').eq('project_id', project.id).order('sort_order', { ascending: true }),
        // 任務 2: 抓取類別 (Dropdown 來源)
        supabase.from('categories').select('*').eq('user_id', project.user_id).order('name'),
        // 任務 3: 初始帳務
        supabase.from('transactions').select(`*, transaction_participants (personnel_id)`).eq('project_id', project.id).order('date', { ascending: false }).order('created_at', { ascending: false }).range(0, PAGE_SIZE - 1)
      ];

      if (currentStatus !== 'active') {
        tasks.push(supabase.from('project_settlements').select('*').eq('project_id', project.id).order('is_cleared', { ascending: true }));
      }

      const results = await Promise.all(tasks);
      const [persRes, catRes, txRes, setRes] = results;

      if (persRes.data) setLocalPersonnel(persRes.data);
      if (catRes.data) {
        setLocalCategories(catRes.data);
        const isEmpty = (catRes.data.length === 0);
        if (setIsTypesEmpty) setIsTypesEmpty(isEmpty);
        if (isEmpty) setIsCategoryWarningOpen(true);
      }
      if (txRes.data) {
        setTransactions(txRes.data);
        setHasMore(txRes.data.length === PAGE_SIZE);
      }
      if (setRes && setRes.data) setSettlements(setRes.data);

    } catch (err) {
      console.error("初始化失敗:", err);
    } finally {
      setLoading(false); 
    }
  }, [project?.id, project?.user_id, currentStatus, setIsTypesEmpty]);

  useEffect(() => {
    initProjectData();
  }, [initProjectData, lastUpdated]);

  // ★ 核心 B：靜默更新通道 (成員管理用，秒更新紅點)
  const refreshPersonnelOnly = async () => {
    try {
      const { data } = await supabase.from('personnel').select('*').eq('project_id', project?.id).order('sort_order', { ascending: true });
      if (data) setLocalPersonnel(data);
      if (onRefresh) onRefresh();
    } catch (err) { console.error(err); }
  };

  // 安全檢查：防止 project 為空時黑屏
  if (!project || !project.id) return <LoadingScreen text="正在載入..." />;

  const getName = (id) => {
    const found = localPersonnel.find(p => p.id === id);
    if (!found) return '未知成員';
    return found.linked_user_id === user?.id ? `${found.name} (你)` : found.name;
  };

  const fetchTransactions = useCallback(async (targetPage, isAppend = false) => {
    try {
      if (isAppend) setIsFetchingMore(true);
      const from = targetPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase.from('transactions').select(`*, transaction_participants (personnel_id)`).eq('project_id', project.id).order('date', { ascending: false }).order('created_at', { ascending: false }).range(from, to);
      if (error) throw error;
      if (isAppend) setTransactions(prev => [...prev, ...data]);
      else setTransactions(data || []);
      setHasMore((data || []).length === PAGE_SIZE);
    } catch (err) { console.error(err); }
    finally { setIsFetchingMore(false); }
  }, [project.id]);

  const handleLoadMore = () => { const nextPage = page + 1; setPage(nextPage); fetchTransactions(nextPage, true); };

  // ★ 完整結算演算法 (保留完整邏輯)
  const calculatedSettlements = useMemo(() => {
    if (currentStatus !== 'active' || transactions.length === 0) return [];
    const balances = {}; 
    transactions.forEach(t => {
      const amount = Number(t.amount); const payerId = t.payer_id;
      if (!balances[payerId]) balances[payerId] = 0; balances[payerId] += amount;
      if (t.type === 'debt') { const debtorId = t.debtor_id; if (!balances[debtorId]) balances[debtorId] = 0; balances[debtorId] -= amount; } 
      else if (t.type === 'advance') { const participants = t.transaction_participants || []; if (participants.length > 0) { const splitAmount = amount / participants.length; participants.forEach(p => { const pid = p.personnel_id; if (!balances[pid]) balances[pid] = 0; balances[pid] -= splitAmount; }); } }
    });
    let debtors = []; let creditors = []; Object.entries(balances).forEach(([id, amount]) => { const val = Math.round(amount * 100) / 100; if (val < -0.01) debtors.push({ id, amount: val }); if (val > 0.01) creditors.push({ id, amount: val }); });
    debtors.sort((a, b) => a.amount - b.amount); creditors.sort((a, b) => b.amount - a.amount); 
    const result = []; let i = 0; let j = 0; 
    while (i < debtors.length && j < creditors.length) { let debtor = debtors[i]; let creditor = creditors[j]; let amount = Math.min(Math.abs(debtor.amount), creditor.amount); amount = Math.round(amount * 100) / 100; if (amount > 0) result.push({ from: debtor.id, to: creditor.id, amount: amount }); debtor.amount += amount; creditor.amount -= amount; if (Math.abs(debtor.amount) < 0.01) i++; if (creditor.amount < 0.01) j++; }
    return result;
  }, [transactions, currentStatus]);

  // ★ 狀態變更 (立即切換本地狀態)
  const executeStartSettlement = async () => { setIsSettlementLoading(true); try { const payload = calculatedSettlements.map(item => ({ from: item.from, to: item.to, amount: Number(item.amount) })); const { error } = await supabase.rpc('start_project_settlement', { p_project_id: project.id, p_settlement_items: payload }); if (error) throw error; message.success('已進入結算模式'); setIsStartConfirmOpen(false); setCurrentStatus('settling'); if (onRefresh) await onRefresh(); } catch (err) { message.error(err.message); } finally { setIsSettlementLoading(false); } };
  const executeCancelSettlement = async () => { setIsSettlementLoading(true); try { const { error } = await supabase.rpc('cancel_project_settlement', { p_project_id: project.id }); if (error) throw error; message.success('已退回記帳模式'); setIsCancelConfirmOpen(false); setCurrentStatus('active'); if (onRefresh) await onRefresh(); } catch (err) { message.error('操作失敗'); } finally { setIsSettlementLoading(false); } };
  const executeArchiveProject = async () => { setIsSettlementLoading(true); try { const { error } = await supabase.rpc('archive_project', { p_project_id: project.id }); if (error) throw error; message.success('專案已歸檔 🎉'); setIsArchiveConfirmOpen(false); setCurrentStatus('archived'); if (onRefresh) await onRefresh(); } catch (err) { message.error(err.message); } finally { setIsSettlementLoading(false); } };
  const handleItemClick = async (item) => { if (item.is_cleared) { try { await supabase.from('project_settlements').update({ is_cleared: false, remark: null }).eq('id', item.id); const { data } = await supabase.from('project_settlements').select('*').eq('project_id', project.id).order('is_cleared', { ascending: true }); if(data) setSettlements(data); } catch (err) { message.error('操作失敗'); } } else { setCheckingItem(item); setIsCheckModalOpen(true); } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      {loading && <LoadingScreen text={project?.name || "載入中"} />}
      {isSettlementLoading && <LoadingScreen transparent={true} text="處理中..." />}
      
      <ProjectHeader 
        project={{...project, status: currentStatus}} 
        onBack={onBack} 
        onOpenPersonnel={() => setIsPersonnelModalOpen(true)}
        onAddTransaction={() => { setEditingTransaction(null); setIsAddModalOpen(true); }}
        personnel={localPersonnel}
        showPersonnelBadge={showPersonnelBadge} 
      />
      
      <main className="band-container" style={{ flex: 1, overflowY: 'auto', paddingBottom: '40px' }}>
  {currentStatus === 'active' && (
    <DebtOverviewCard calculatedSettlements={calculatedSettlements} isOwner={isOwner} onStartSettlement={() => setIsStartConfirmOpen(true)} getName={getName} />
  )}
  {(currentStatus === 'settling' || currentStatus === 'archived') && (
    <SettlementList project={{...project, status: currentStatus}} settlements={settlements} isOwner={isOwner} onItemClick={handleItemClick} onCancel={() => setIsCancelConfirmOpen(true)} onFinish={() => setIsArchiveConfirmOpen(true)} getName={getName} />
  )}
  
  {/* ★ 關鍵：這裡必須傳入 categories={localCategories} 否則子元件抓不到顏色 */}
  <TransactionList 
    transactions={transactions} 
    loading={loading} 
    onEditTransaction={(t) => { setEditingTransaction(t); setIsAddModalOpen(true); }} 
    projectStatus={currentStatus} 
    getName={getName}
    categories={localCategories} 
  />
  
  {!loading && transactions.length > 0 && (
     <ScrollObserver onIntersect={handleLoadMore} hasMore={hasMore} loading={isFetchingMore} />
  )}
</main>

      {/* ★ 記帳視窗：數據直連版 */}
      {project?.id && (
        <AddTransactionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          project={project}
          transaction={editingTransaction}
          personnel={localPersonnel}
          categories={localCategories}
          user={user}
          onRefresh={async () => {
            await initProjectData();
            if (onRefresh) onRefresh();
            setIsAddModalOpen(false);
          }}
        />
      )}

      <AlertModal isOpen={isCategoryWarningOpen} title="專案尚未設定帳款類型" content={isOwner ? "請至選單->系統設定->帳款類型管理" : "請通知專案擁有者設定 【帳款類型】"} onConfirm={() => setIsCategoryWarningOpen(false)} okText="我知道了" />
      <ProjectPersonnelModal isOpen={isPersonnelModalOpen} onClose={() => setIsPersonnelModalOpen(false)} project={project} user={user} onRefresh={refreshPersonnelOnly} />
      <ConfirmModal open={isStartConfirmOpen} title="確定開始結算？" onConfirm={executeStartSettlement} content="進入結算模式後，將無法新增帳款以及人員" onCancel={() => setIsStartConfirmOpen(false)} loading={isSettlementLoading} />
      <ConfirmModal open={isCancelConfirmOpen} title="取消結算並回退？" onConfirm={executeCancelSettlement} content="這將會清空目前的勾選進度" onCancel={() => setIsCancelConfirmOpen(false)} loading={isSettlementLoading} />
      <ConfirmModal open={isArchiveConfirmOpen} title="確認完成並歸檔？" onConfirm={executeArchiveProject} content="歸檔後專案將封存" onCancel={() => setIsArchiveConfirmOpen(false)} loading={isSettlementLoading} okText="確認歸檔" />
      <CheckSettlementModal isOpen={isCheckModalOpen} onClose={() => setIsCheckModalOpen(false)} item={checkingItem} onRefresh={async () => { const { data } = await supabase.from('project_settlements').select('*').eq('project_id', project.id).order('is_cleared', { ascending: true }); if(data) setSettlements(data); }} getName={getName} />
    </div>
  );
};

export default ProjectDetailView;