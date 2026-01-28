import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { message, Modal } from 'antd'; // 引入 Modal 以防萬一
import { useAuth } from '../context/AuthContext'; 

// Components
import LoadingScreen from '../components/LoadingScreen';
import ConfirmModal from '../components/ConfirmModal';
import ProjectPersonnelModal from '../components/ProjectPersonnelModal';

// Project Specific Components
import ProjectHeader from '../components/project/ProjectHeader';
import DebtOverviewCard from '../components/project/DebtOverviewCard';
import SettlementList from '../components/project/SettlementList';
import TransactionList from '../components/project/TransactionList';
import CheckSettlementModal from '../components/project/CheckSettlementModal'; // ★ 新增

const ProjectDetailView = ({ project, onBack, onAddTransaction, onEditTransaction, lastUpdated, personnel = [], onRefresh }) => {
  const { user } = useAuth(); 
  
  // Data State
  const [transactions, setTransactions] = useState([]);
  const [settlements, setSettlements] = useState([]); 
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [isSettlementLoading, setIsSettlementLoading] = useState(false);
  
  // Modals
  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  const [isStartConfirmOpen, setIsStartConfirmOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  
  // ★ 新增：核銷備註彈窗狀態
  const [isCheckModalOpen, setIsCheckModalOpen] = useState(false);
  const [checkingItem, setCheckingItem] = useState(null);

  const isOwner = user?.id === project.user_id;

  // --- Helper: Get Name ---
  const projectPersonnel = useMemo(() => {
    return personnel.filter(p => p.project_id === project.id);
  }, [personnel, project.id]);

  const getName = (id) => {
    const found = projectPersonnel.find(p => p.id === id);
    if (!found) return '未知成員';
    return found.linked_user_id === user?.id ? `${found.name} (你)` : found.name;
  };

  // --- Effects ---
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`*, transaction_participants (personnel_id)`)
          .eq('project_id', project.id)
          .order('date', { ascending: false });

        if (error) throw error;
        setTransactions(data || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchTransactions();
  }, [project.id, lastUpdated]);

  const fetchSettlements = async () => {
    try {
      const { data, error } = await supabase
        .from('project_settlements')
        .select('*')
        .eq('project_id', project.id)
        .order('is_cleared', { ascending: true }); 
      if (error) throw error;
      setSettlements(data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (project.status === 'settling' || project.status === 'archived') {
      fetchSettlements();
    }
  }, [project.id, project.status]);


  // --- Logic: Calculation ---
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


  // --- Handlers ---

  const executeStartSettlement = async () => {
    setIsSettlementLoading(true);
    try {
      const payload = calculatedSettlements.map(item => ({
        from: item.from, to: item.to, amount: Number(item.amount) 
      }));
      const { error } = await supabase.rpc('start_project_settlement', {
        p_project_id: project.id, settlement_items: payload 
      });
      if (error) throw error;
      message.success('已進入結算模式');
      setIsStartConfirmOpen(false); 
      if (onRefresh) await onRefresh(); 
    } catch (err) {
      message.error('結算失敗：' + err.message);
    } finally {
      setIsSettlementLoading(false);
    }
  };

  const executeCancelSettlement = async () => {
    setIsSettlementLoading(true);
    try {
      const { error } = await supabase.rpc('cancel_project_settlement', { p_project_id: project.id });
      if (error) throw error;
      message.success('已退回記帳模式');
      setIsCancelConfirmOpen(false);
      if (onRefresh) await onRefresh();
    } catch (err) {
      message.error('操作失敗');
    } finally {
      setIsSettlementLoading(false);
    }
  };

  // ★ 新邏輯：點擊分帳項目
  const handleItemClick = async (item) => {
    if (item.is_cleared) {
      // 如果已經勾選，點擊則是「反悔/取消勾選」
      try {
        const { error } = await supabase
          .from('project_settlements')
          .update({ is_cleared: false, remark: null }) // 取消時順便清空備註? 看需求，這裡先清空
          .eq('id', item.id);
        if (error) throw error;
        fetchSettlements(); // 局部刷新清單即可
      } catch (err) {
        message.error('操作失敗');
      }
    } else {
      // 如果還沒勾選，打開備註彈窗
      setCheckingItem(item);
      setIsCheckModalOpen(true);
    }
  };

  // ★ 新邏輯：完成並歸檔 (手動觸發)
  const handleFinishSettlement = () => {
    Modal.confirm({
      title: '確認完成並歸檔？',
      content: '歸檔後專案將變為唯讀狀態。',
      okText: '確認歸檔',
      cancelText: '取消',
      onOk: async () => {
        setIsSettlementLoading(true);
        try {
          const { error } = await supabase.rpc('archive_project', { p_project_id: project.id });
          if (error) throw error;
          message.success('專案已歸檔 🎉');
          if (onRefresh) await onRefresh();
        } catch (err) {
          message.error('歸檔失敗');
        } finally {
          setIsSettlementLoading(false);
        }
      }
    });
  };


  // --- Render ---

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      {isSettlementLoading && <LoadingScreen transparent={true} text="處理中..." />}

      <ProjectHeader 
        project={project}
        onBack={onBack}
        onOpenPersonnel={() => setIsPersonnelModalOpen(true)}
        onAddTransaction={onAddTransaction}
      />

      <main className="band-container" style={{ flex: 1, overflowY: 'auto', paddingBottom: '40px' }}>
        
        {project.status === 'active' && (
          <DebtOverviewCard 
            calculatedSettlements={calculatedSettlements}
            isOwner={isOwner}
            onStartSettlement={() => setIsStartConfirmOpen(true)}
            getName={getName}
          />
        )}

        {(project.status === 'settling' || project.status === 'archived') && (
          <SettlementList 
            project={project}
            settlements={settlements}
            isOwner={isOwner}
            // ★ 修改：點擊項目處理
            onItemClick={handleItemClick}
            onCancel={() => setIsCancelConfirmOpen(true)}
            // ★ 新增：完成按鈕
            onFinish={handleFinishSettlement}
            getName={getName}
          />
        )}

        <TransactionList 
          transactions={transactions}
          loading={loading}
          onEditTransaction={onEditTransaction}
          projectStatus={project.status}
          getName={getName}
        />

      </main>

      {/* Modals */}
      <ProjectPersonnelModal 
        isOpen={isPersonnelModalOpen}
        onClose={() => setIsPersonnelModalOpen(false)}
        project={project}
        user={user} 
        onRefresh={onRefresh} 
      />

      <ConfirmModal
        open={isStartConfirmOpen}
        title="確定開始結算？"
        content="進入結算模式後，將無法再新增或修改任何帳務。系統將鎖定目前的債務關係。"
        onConfirm={executeStartSettlement}
        onCancel={() => setIsStartConfirmOpen(false)}
        loading={isSettlementLoading}
      />

      <ConfirmModal
        open={isCancelConfirmOpen}
        title="取消結算並退回？"
        content="這將會清空目前的勾選進度，並重新開放記帳功能。"
        onConfirm={executeCancelSettlement}
        onCancel={() => setIsCancelConfirmOpen(false)}
        loading={isSettlementLoading}
      />

      {/* ★ 新增備註彈窗 */}
      <CheckSettlementModal 
        isOpen={isCheckModalOpen}
        onClose={() => setIsCheckModalOpen(false)}
        item={checkingItem}
        onRefresh={fetchSettlements} // 核銷後刷新清單
        getName={getName}
      />
    </div>
  );
};

export default ProjectDetailView;