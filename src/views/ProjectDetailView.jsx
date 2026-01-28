import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Plus, DollarSign, User, Calendar, ArrowRight, Wallet } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';

// ★ 1. 確保接收 personnel prop
const ProjectDetailView = ({ project, onBack, onAddTransaction, onEditTransaction, lastUpdated, personnel = [] }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            payer:personnel!payer_id(name),
            debtor:personnel!debtor_id(name),  
            category:categories!category_id(name),
            transaction_participants(
              personnel_id,
              personnel(name)
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

  // ★ 2. 核心算法：加入「手動查表」邏輯 (雙重保險)
  const settlements = useMemo(() => {
    const debts = {}; 
    
    // 輔助函式：如果 API 沒回傳名字，就從 personnel 列表查
    const getName = (obj, id) => {
      if (obj && obj.name) return obj.name; // API 有抓到
      const found = personnel.find(p => p.id === id); // 手動查表
      return found ? found.name : '未知成員';
    };

    transactions.forEach(t => {
      const payerId = t.payer_id;
      const payerName = getName(t.payer, payerId);

      if (t.type === 'advance') {
        const participants = t.transaction_participants || [];
        if (participants.length > 0) {
          const splitAmount = t.amount / participants.length;
          participants.forEach(p => {
            if (p.personnel_id !== payerId) {
              const debtorId = p.personnel_id;
              // 這裡要注意：participants 的結構裡有 personnel 物件
              const debtorName = p.personnel?.name || getName(null, debtorId);
              
              if (!debts[debtorId]) debts[debtorId] = { name: debtorName, owed: {} };
              if (!debts[debtorId].owed[payerId]) debts[debtorId].owed[payerId] = { name: payerName, amount: 0 };
              
              debts[debtorId].owed[payerId].amount += splitAmount;
            }
          });
        }
      } else if (t.type === 'debt') {
        const debtorId = t.debtor_id;
        // ★ 欠款模式下，使用查表邏輯
        const debtorName = getName(t.debtor, debtorId); 

        // 如果連 ID 都沒有，跳過
        if (!debtorId) return; 

        if (!debts[debtorId]) debts[debtorId] = { name: debtorName, owed: {} };
        if (!debts[debtorId].owed[payerId]) debts[debtorId].owed[payerId] = { name: payerName, amount: 0 };
        
        debts[debtorId].owed[payerId].amount += Number(t.amount);
      }
    });

    const results = [];
    const processedPairs = new Set(); 

    Object.keys(debts).forEach(debtorId => {
      const debtorName = debts[debtorId].name;
      const creditors = debts[debtorId].owed;

      Object.keys(creditors).forEach(creditorId => {
        const pairKey = [debtorId, creditorId].sort().join('-');
        if (processedPairs.has(pairKey)) return;

        const amountAtoB = debts[debtorId]?.owed[creditorId]?.amount || 0; 
        const amountBtoA = debts[creditorId]?.owed[debtorId]?.amount || 0; 
        const net = amountAtoB - amountBtoA;

        // 確保雙方名字都正確
        const creditorName = creditors[creditorId].name; 
        const debtorNameReal = debtorName;
        const otherPartyName = debts[creditorId]?.name || creditorName; 

        if (net > 0.1) {
          results.push({ from: debtorNameReal, to: creditorName, amount: net });
        } else if (net < -0.1) {
          results.push({ from: otherPartyName, to: debtorNameReal, amount: Math.abs(net) });
        }
        processedPairs.add(pairKey);
      });
    });

    return results;
  }, [transactions, personnel]); // ★ 依賴加入 personnel

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      
      {/* A. 頂部導航列 */}
      <header className="navbar" style={{ flexShrink: 0, backgroundColor: 'var(--color-bg-main)', position: 'relative', zIndex: 10, boxShadow: '0 1px 0 rgba(255,255,255,0.05)' }}>
        <button onClick={onBack} className="hamburger-btn">
          <ChevronLeft size={24} color="var(--color-text-main)"/>
        </button>
        <span className="nav-brand" style={{ fontSize: '18px', fontWeight: '800' }}>{project.name}</span>
        <button 
          onClick={onAddTransaction} 
          style={{ background: 'var(--color-primary)', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Plus size={20} color="#fff" />
        </button>
      </header>

      {/* B. 內容區 */}
      <main className="band-container" style={{ flex: 1, overflowY: 'auto', paddingBottom: '40px', WebkitOverflowScrolling: 'touch' }}>
        
        {/* 1. 結算結果卡片 */}
        <div className="band-card" style={{ background: 'linear-gradient(135deg, #1e1e1e 0%, #141414 100%)', padding: '24px 20px', marginBottom: '32px', border: '1px solid #333' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '12px' }}>
            <Wallet size={20} color="var(--color-primary)" />
            <span style={{ color: '#fff', fontSize: '16px', fontWeight: '800' }}>目前分帳結算</span>
          </div>
          {settlements.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {settlements.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ccc', fontSize: '15px', fontWeight: '500' }}>
                    <span style={{ color: '#fff', fontWeight: '700' }}>{item.from}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontSize: '12px' }}>給<ArrowRight size={14} /></div>
                    <span style={{ color: 'var(--color-primary)', fontWeight: '700' }}>{item.to}</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff', fontFamily: 'monospace' }}>${Math.round(item.amount).toLocaleString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '10px 0', color: '#666', fontSize: '14px' }}>目前所有帳務已結清。</div>
          )}
        </div>

        {/* 2. 紀錄標題列 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 4px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--color-text-main)' }}>帳務紀錄</h2>
          <span style={{ fontSize: '13px', color: 'var(--color-text-sub)', fontWeight: '600' }}>共 {transactions.length} 筆</span>
        </div>

        {/* 3. 交易清單 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--color-text-sub)' }}>讀取中...</div>
        ) : transactions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {transactions.map(t => (
              <TransactionCard 
                key={t.id} 
                transaction={t} 
                onClick={() => onEditTransaction && onEditTransaction(t)} 
                personnel={personnel} // ★ 傳遞給卡片，讓卡片也能查表
              />
            ))}
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed #333', padding: '80px 20px', borderRadius: '24px', textAlign: 'center' }}>
            <p style={{ color: '#555', fontSize: '15px' }}>尚無帳務紀錄</p>
          </div>
        )}
      </main>
    </div>
  );
};

// 交易卡片
const TransactionCard = ({ transaction, onClick, personnel }) => {
  const isDebt = transaction.type === 'debt';
  const formattedDate = new Date(transaction.date).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
  
  // ★ 使用 personnel 查表
  const payerName = transaction.payer?.name || personnel?.find(p => p.id === transaction.payer_id)?.name || '未知';

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} strokeWidth={3} /><span>{payerName}</span></div>
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