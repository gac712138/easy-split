import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Plus, DollarSign, User, Calendar, Wallet, Share2, Users } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';
import { useAuth } from '../context/AuthContext'; 
import ProjectPersonnelModal from '../components/ProjectPersonnelModal';

const ProjectDetailView = ({ project, onBack, onAddTransaction, onEditTransaction, lastUpdated, personnel = [], onRefresh }) => {
  const { user } = useAuth(); 
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);

  // 1. 過濾出屬於這個專案的人員
  const projectPersonnel = useMemo(() => {
    return personnel.filter(p => p.project_id === project.id);
  }, [personnel, project.id]);

  // 查表輔助函式
  const getName = (id) => {
    const found = projectPersonnel.find(p => p.id === id);
    if (!found) return '未知成員';
    return found.linked_user_id === user?.id ? `${found.name} (你)` : found.name;
  };

  // 邀請功能
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

  // 讀取帳務
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            category:categories!category_id(name),
            transaction_participants (
              personnel_id
            )
          `)
          .eq('project_id', project.id)
          .order('date', { ascending: false });

        if (error) throw error;
        setTransactions(data || []);
      } catch (err) {
        console.error("讀取失敗:", err.message);
        message.error("無法載入帳務資料");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [project.id, lastUpdated]);

  // 核心演算法：計算結算
  const settlements = useMemo(() => {
    const balances = {}; 

    // A. 計算淨餘額
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

    // B. 分離與排序
    let debtors = [];
    let creditors = [];

    Object.entries(balances).forEach(([id, amount]) => {
      const val = Math.round(amount * 100) / 100;
      if (val < -0.01) debtors.push({ id, amount: val }); 
      if (val > 0.01) creditors.push({ id, amount: val }); 
    });

    debtors.sort((a, b) => a.amount - b.amount); 
    creditors.sort((a, b) => b.amount - a.amount); 

    // C. 配對
    const result = [];
    let i = 0; 
    let j = 0; 

    while (i < debtors.length && j < creditors.length) {
      let debtor = debtors[i];
      let creditor = creditors[j];
      let amount = Math.min(Math.abs(debtor.amount), creditor.amount);
      amount = Math.round(amount * 100) / 100;

      if (amount > 0) {
        result.push({
          from: debtor.id,
          to: creditor.id,
          amount: amount
        });
      }

      debtor.amount += amount;
      creditor.amount -= amount;

      if (Math.abs(debtor.amount) < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    return result;
  }, [transactions]);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      
      {/* Header */}
      <header className="navbar" style={{ flexShrink: 0, backgroundColor: 'var(--color-bg-main)', position: 'relative', zIndex: 10 }}>
        <button onClick={onBack} className="hamburger-btn">
          <ChevronLeft size={24} color="var(--color-text-main)"/>
        </button>
        <span className="nav-brand" style={{ fontSize: '18px', fontWeight: '800' }}>{project.name}</span>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleInvite} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Share2 size={20} color="#fff" />
          </button>
          <button onClick={() => setIsPersonnelModalOpen(true)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Users size={20} color="#fff" />
          </button>
          <button onClick={onAddTransaction} style={{ background: 'var(--color-primary)', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Plus size={20} color="#fff" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="band-container" style={{ flex: 1, overflowY: 'auto', paddingBottom: '40px' }}>
        
        {/* Settlement Card */}
        <div className="band-card" style={{ background: 'linear-gradient(135deg, #1e1e1e 0%, #141414 100%)', padding: '24px 20px', marginBottom: '32px', border: '1px solid #333' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wallet size={20} color="var(--color-primary)" />
              <span style={{ color: '#fff', fontSize: '16px', fontWeight: '800' }}>帳務總覽</span>
            </div>
            <span style={{ color: '#666', fontSize: '12px' }}>{transactions.length} 筆交易</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {settlements.length > 0 ? (
              settlements.map((s, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ccc', fontSize: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '700', color: '#fff' }}>{getName(s.from)}</span>
                    <span style={{ fontSize: '12px', color: '#888' }}>需付</span>
                    <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{getName(s.to)}</span>
                  </div>
                  <div style={{ fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>NT$</span>
                    {s.amount.toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: '#555', fontSize: '14px', padding: '10px 0' }}>
                目前結清，沒有債務！🎉
              </div>
            )}
          </div>
        </div>

        {/* Transaction List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#666' }}>讀取中...</div>
        ) : transactions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {transactions.map(t => (
              <TransactionCard 
                key={t.id} 
                transaction={t} 
                onClick={() => onEditTransaction && onEditTransaction(t)} 
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
      </main>

      {/* ★ 關鍵修改：傳遞 user 屬性 */}
      <ProjectPersonnelModal 
        isOpen={isPersonnelModalOpen}
        onClose={() => setIsPersonnelModalOpen(false)}
        project={project}
        user={user} // 新增這行
        onRefresh={onRefresh} 
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
        cursor: 'pointer' 
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