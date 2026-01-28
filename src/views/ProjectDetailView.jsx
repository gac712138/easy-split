import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Plus, DollarSign, User, Calendar, Wallet, Share2, Users, Calculator, CheckCircle, RotateCcw, Archive, FileText } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';
import { useAuth } from '../context/AuthContext'; 
import ProjectPersonnelModal from '../components/ProjectPersonnelModal';
import LoadingScreen from '../components/LoadingScreen';
import ConfirmModal from '../components/ConfirmModal';

const ProjectDetailView = ({ project, onBack, onAddTransaction, onEditTransaction, lastUpdated, personnel = [], onRefresh }) => {
  const { user } = useAuth(); 
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 結算相關資料
  const [settlements, setSettlements] = useState([]); 
  const [isSettlementLoading, setIsSettlementLoading] = useState(false);

  // Modal 開關狀態
  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  
  const [isStartConfirmOpen, setIsStartConfirmOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const isOwner = user?.id === project.user_id;

  // 過濾人員
  const projectPersonnel = useMemo(() => {
    return personnel.filter(p => p.project_id === project.id);
  }, [personnel, project.id]);

  const getName = (id) => {
    const found = projectPersonnel.find(p => p.id === id);
    if (!found) return '未知成員';
    return found.linked_user_id === user?.id ? `${found.name} (你)` : found.name;
  };

  const handleInvite = () => {
    if (!project.invite_code) {
      message.error('此專案沒有邀請碼');
      return;
    }
    const inviteLink = `${window.location.origin}${window.location.pathname}?code=${project.invite_code}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      message.success('已複製邀請連結！傳給朋友吧');
    }).catch(() => {
      message.error('複製失敗，請手動複製');
    });
  };

  // --- 資料讀取區 ---

  // A. 讀取帳務 (★ 修正：移除 status 檢查，任何狀態都要讀取帳務)
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            category:categories!category_id(name),
            transaction_participants (personnel_id)
          `)
          .eq('project_id', project.id)
          .order('date', { ascending: false });

        if (error) throw error;
        setTransactions(data || []);
      } catch (err) {
        console.error("讀取失敗:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [project.id, lastUpdated]); // 只要專案ID或更新訊號變了就重抓

  // B. 讀取結算清單 (Settling/Archived 狀態)
  const fetchSettlementsFromDB = async () => {
    try {
      const { data, error } = await supabase
        .from('project_settlements')
        .select('*')
        .eq('project_id', project.id)
        .order('is_cleared', { ascending: true }); 

      if (error) throw error;
      setSettlements(data || []);
    } catch (err) {
      console.error('讀取結算失敗', err);
    }
  };

  // 監聽狀態變更，如果是結算中就抓取結算資料
  useEffect(() => {
    if (project.status === 'settling' || project.status === 'archived') {
      fetchSettlementsFromDB();
    }
  }, [project.id, project.status]);


  // --- 核心演算法 (只在 active 時用來預覽) ---
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
      } 
      else if (t.type === 'advance') {
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

    let debtors = [];
    let creditors = [];
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
      let debtor = debtors[i];
      let creditor = creditors[j];
      let amount = Math.min(Math.abs(debtor.amount), creditor.amount);
      amount = Math.round(amount * 100) / 100;

      if (amount > 0) {
        result.push({ from: debtor.id, to: creditor.id, amount: amount });
      }
      debtor.amount += amount;
      creditor.amount -= amount;
      if (Math.abs(debtor.amount) < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }
    return result;
  }, [transactions, project.status]);


  // --- Actions ---

  const executeStartSettlement = async () => {
    setIsSettlementLoading(true);
    try {
      const payload = calculatedSettlements.map(item => ({
        from: item.from,
        to: item.to,
        amount: Number(item.amount) 
      }));

      const { error } = await supabase.rpc('start_project_settlement', {
        p_project_id: project.id,
        settlement_items: payload 
      });

      if (error) throw error;
      
      message.success('已進入結算模式');
      setIsStartConfirmOpen(false); 
      
      // ★ 狀態變更後，刷新父層資料，這會導致 project.status 更新，進而觸發 UI 重繪
      if (onRefresh) await onRefresh(); 

    } catch (err) {
      console.error(err);
      message.error('結算失敗：' + err.message);
    } finally {
      setIsSettlementLoading(false);
    }
  };

  const executeCancelSettlement = async () => {
    setIsSettlementLoading(true);
    try {
      const { error } = await supabase.rpc('cancel_project_settlement', {
        p_project_id: project.id
      });
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

  const handleToggleSettlement = async (item) => {
    if (!isOwner) {
      message.warning('只有專案擁有者可以確認還款狀況');
      return;
    }
    const originalSettlements = [...settlements];
    setSettlements(prev => prev.map(s => s.id === item.id ? { ...s, is_cleared: !s.is_cleared } : s));

    try {
      const { error } = await supabase.from('project_settlements').update({ is_cleared: !item.is_cleared }).eq('id', item.id);
      if (error) throw error;

      const allCleared = originalSettlements.every(s => s.id === item.id ? !s.is_cleared : s.is_cleared);
      if (allCleared) {
         message.success('恭喜！所有款項已結清，專案自動歸檔 🎉');
         await supabase.rpc('archive_project', { p_project_id: project.id });
         onRefresh && onRefresh();
      }
    } catch (err) {
      message.error('更新失敗');
      setSettlements(originalSettlements);
    }
  };


  // --- 畫面渲染 ---

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      {isSettlementLoading && <LoadingScreen transparent={true} text="處理中..." />}

      {/* Header */}
      <header className="navbar" style={{ flexShrink: 0, backgroundColor: 'var(--color-bg-main)', position: 'relative', zIndex: 10 }}>
        <button onClick={onBack} className="hamburger-btn">
          <ChevronLeft size={24} color="var(--color-text-main)"/>
        </button>
        <span className="nav-brand" style={{ fontSize: '18px', fontWeight: '800' }}>
          {project.name} 
          {project.status === 'settling' && <span style={{ fontSize: '12px', background: 'var(--color-primary)', color: '#000', padding: '2px 8px', borderRadius: '10px', marginLeft: '8px', verticalAlign: 'middle' }}>結算中</span>}
          {project.status === 'archived' && <span style={{ fontSize: '12px', background: '#333', color: '#ccc', padding: '2px 8px', borderRadius: '10px', marginLeft: '8px', verticalAlign: 'middle' }}>已歸檔</span>}
        </span>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleInvite} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Share2 size={20} color="#fff" />
          </button>
          <button onClick={() => setIsPersonnelModalOpen(true)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Users size={20} color="#fff" />
          </button>
          
          {/* Active 狀態才顯示新增按鈕 */}
          {project.status === 'active' && (
            <button onClick={onAddTransaction} style={{ background: 'var(--color-primary)', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Plus size={20} color="#fff" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="band-container" style={{ flex: 1, overflowY: 'auto', paddingBottom: '40px' }}>
        
        {/* === 區塊 A: Active 狀態顯示「債務預覽卡片」 === */}
        {project.status === 'active' && (
          <div className="band-card" style={{ background: 'linear-gradient(135deg, #1e1e1e 0%, #141414 100%)', padding: '24px 20px', marginBottom: '32px', border: '1px solid #333' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={20} color="var(--color-primary)" />
                <span style={{ color: '#fff', fontSize: '16px', fontWeight: '800' }}>目前債務概況</span>
              </div>
              {isOwner && calculatedSettlements.length > 0 && (
                <button onClick={() => setIsStartConfirmOpen(true)} style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(58, 143, 183, 0.2)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calculator size={14} /> 開始結算
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {calculatedSettlements.length > 0 ? (
                calculatedSettlements.map((s, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ccc', fontSize: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', color: '#fff' }}>{getName(s.from)}</span>
                      <span style={{ fontSize: '12px', color: '#888' }}>需付</span>
                      <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{getName(s.to)}</span>
                    </div>
                    <div style={{ fontWeight: '900', color: '#fff' }}>
                      NT$ {s.amount.toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#555', fontSize: '14px', padding: '10px 0' }}>目前無債務</div>
              )}
            </div>
          </div>
        )}

        {/* === 區塊 B: Settling/Archived 狀態顯示「結算 Checkbox」 === */}
        {(project.status === 'settling' || project.status === 'archived') && (
          <div style={{ paddingTop: '20px', marginBottom: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: project.status === 'archived' ? '#4caf50' : 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px', boxShadow: '0 8px 16px -4px rgba(0,0,0,0.3)' }}>
                 {project.status === 'archived' ? <Archive /> : <Calculator />}
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
                {project.status === 'archived' ? '專案已結案' : '專案結算中'}
              </h2>
              <p style={{ color: '#888', fontSize: '14px', maxWidth: '80%', margin: '0 auto' }}>
                {project.status === 'archived' ? '所有款項已結清，此專案現為唯讀狀態。' : '請專案擁有者確認款項，並勾選已完成的項目。'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {settlements.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => project.status === 'settling' && handleToggleSettlement(item)}
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px', borderRadius: '16px',
                    background: item.is_cleared ? 'rgba(76, 175, 80, 0.1)' : '#1e1e1e',
                    border: item.is_cleared ? '1px solid #4caf50' : '1px solid #333',
                    opacity: item.is_cleared ? 0.6 : 1,
                    cursor: (isOwner && project.status === 'settling') ? 'pointer' : 'default',
                    transition: '0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', 
                      border: item.is_cleared ? 'none' : '2px solid #666',
                      background: item.is_cleared ? '#4caf50' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {item.is_cleared && <CheckCircle size={16} color="#fff" />}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ color: '#fff', fontSize: '16px', fontWeight: '700', textDecoration: item.is_cleared ? 'line-through' : 'none' }}>
                         {getName(item.from_personnel_id)} <span style={{ color: '#666', fontSize: '12px' }}>付給</span> {getName(item.to_personnel_id)}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ fontWeight: '900', color: item.is_cleared ? '#4caf50' : 'var(--color-primary)', fontSize: '16px', textDecoration: item.is_cleared ? 'line-through' : 'none' }}>
                    ${Number(item.amount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {isOwner && project.status === 'settling' && (
              <div style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: '1px solid #333' }}>
                <button 
                  onClick={() => setIsCancelConfirmOpen(true)}
                  style={{ 
                    background: 'none', border: '1px solid #ff6b6b', color: '#ff6b6b', 
                    padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', 
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <RotateCcw size={16} /> 取消結算，退回記帳模式
                </button>
              </div>
            )}
          </div>
        )}

        {/* === 區塊 C: 共用 - 歷史帳務列表 (Always Visible) === */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* 如果是結算狀態，加一個小標題區隔 */}
          {(project.status === 'settling' || project.status === 'archived') && (
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#666' }}>
                <FileText size={16} />
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>歷史帳務紀錄</span>
             </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: '#666' }}>讀取中...</div>
          ) : transactions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {transactions.map(t => (
                <TransactionCard 
                  key={t.id} 
                  transaction={t} 
                  // 只有 active 狀態才允許點擊編輯，否則只能看
                  onClick={() => project.status === 'active' && onEditTransaction && onEditTransaction(t)} 
                  personnel={projectPersonnel}
                  user={user}
                />
              ))}
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed #333', padding: '80px 20px', borderRadius: '24px', textAlign: 'center' }}>
              <p style={{ color: '#555', fontSize: '15px' }}>尚無帳務，快去記一筆！</p>
            </div>
          )}
        </div>

      </main>

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

    </div>
  );
};

const TransactionCard = ({ transaction, onClick, personnel, user }) => {
  const isDebt = transaction.type === 'debt';
  const formattedDate = new Date(transaction.date).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
  
  const getPayerName = () => {
    const p = personnel?.find(p => p.id === transaction.payer_id);
    if (!p) return '未知';
    return p.linked_user_id === user?.id ? `${p.name} (你)` : p.name;
  };

  return (
    <div 
      className="band-card" 
      onClick={onClick} 
      style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '18px 20px', marginBottom: '12px',
        cursor: onClick ? 'pointer' : 'default' // 唯讀時不顯示手型游標
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: 44, height: 44, borderRadius: '14px', backgroundColor: isDebt ? 'rgba(255, 107, 107, 0.1)' : 'rgba(58, 143, 183, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <DollarSign size={20} color={isDebt ? '#ff6b6b' : 'var(--color-primary)'} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>{transaction.title || '未命名項目'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-sub)', fontSize: '12px', fontWeight: '600' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} strokeWidth={3} /><span>{getPayerName()}</span></div>
            <span style={{ color: '#333' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} strokeWidth={3} /><span>{formattedDate}</span></div>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '17px', fontWeight: '900', color: isDebt ? '#ff6b6b' : '#fff', marginBottom: '6px' }}>{isDebt ? '- ' : ''}{Number(transaction.amount).toLocaleString()}</div>
        <div style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', backgroundColor: isDebt ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 255, 255, 0.05)', color: isDebt ? '#ff6b6b' : '#888', textTransform: 'uppercase' }}>{isDebt ? '欠款' : '墊付'}</div>
      </div>
    </div>
  );
};

export default ProjectDetailView;