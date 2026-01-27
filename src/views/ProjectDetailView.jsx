import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, DollarSign, User, Calendar, Tag } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';

const ProjectDetailView = ({ project, onBack, onAddTransaction }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            payer:personnel!payer_id(name),
            category:categories!category_id(name)
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
  }, [project.id]);

  const totalExpense = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <>
      {/* A. 頂部導航列 - 調用地基 .navbar */}
      <header className="navbar">
        <button onClick={onBack} className="hamburger-btn">
          <ChevronLeft size={24} color="var(--color-text-main)"/>
        </button>
        <span className="nav-brand" style={{ fontSize: '18px', fontWeight: '800' }}>{project.name}</span>
        <button 
          onClick={onAddTransaction} 
          style={{ 
            background: 'var(--color-primary)', 
            border: 'none', 
            borderRadius: '12px', 
            padding: '8px', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Plus size={20} color="#fff" />
        </button>
      </header>

      {/* B. 內容區 - 使用地基 .band-container */}
      <main className="band-container">
        
        {/* 1. 專案總計卡片 - 補足視覺張力 */}
        <div className="band-card" style={{ 
          background: 'linear-gradient(135deg, #1a1a1a 0%, #111 100%)',
          padding: '32px',
          textAlign: 'center',
          marginBottom: '32px',
          border: '1px solid #222'
        }}>
          <span style={{ color: 'var(--color-text-sub)', fontSize: '14px', fontWeight: '700', letterSpacing: '0.1em' }}>
            專案總支出
          </span>
          <div style={{ 
            fontSize: '40px', 
            fontWeight: '900', 
            color: 'var(--color-primary)', 
            marginTop: '8px',
            fontFamily: 'monospace' 
          }}>
            NT$ {totalExpense.toLocaleString()}
          </div>
        </div>

        {/* 2. 紀錄標題列 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 4px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--color-text-main)' }}>帳務紀錄</h2>
          <span style={{ fontSize: '13px', color: 'var(--color-text-sub)', fontWeight: '600' }}>
            共 {transactions.length} 筆
          </span>
        </div>

        {/* 3. 交易清單 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--color-text-sub)' }}>讀取中...</div>
        ) : transactions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {transactions.map(t => (
              <TransactionCard key={t.id} transaction={t} />
            ))}
          </div>
        ) : (
          <div style={{ 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px dashed #333', 
            padding: '80px 20px', 
            borderRadius: '24px', 
            textAlign: 'center' 
          }}>
            <p style={{ color: '#555', fontSize: '15px' }}>尚無帳務紀錄，點擊右上角新增</p>
          </div>
        )}
      </main>
    </>
  );
};

/**
 * 交易卡片 - 調用地基 .band-card 並補足狀態細節
 */
const TransactionCard = ({ transaction }) => {
  const isDebt = transaction.type === 'debt';
  const formattedDate = new Date(transaction.date).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });

  return (
    <div className="band-card" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '18px 20px',
      marginBottom: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* 類別圖示背景 */}
        <div style={{ 
          width: 44, height: 44, borderRadius: '14px',
          backgroundColor: isDebt ? 'rgba(255, 107, 107, 0.1)' : 'rgba(58, 143, 183, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <DollarSign size={20} color={isDebt ? '#ff6b6b' : 'var(--color-primary)'} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>
            {transaction.title || '未命名項目'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-sub)', fontSize: '12px', fontWeight: '600' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <User size={12} strokeWidth={3} />
              <span>{transaction.payer?.name || '未知'}</span>
            </div>
            <span style={{ color: '#333' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} strokeWidth={3} />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 右側金額與標籤 */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ 
          fontSize: '17px', 
          fontWeight: '900', 
          color: isDebt ? '#ff6b6b' : '#fff',
          marginBottom: '6px'
        }}>
          {isDebt ? '- ' : ''}{Number(transaction.amount).toLocaleString()}
        </div>
        <div style={{ 
          display: 'inline-block',
          padding: '2px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '900',
          backgroundColor: isDebt ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 255, 255, 0.05)',
          color: isDebt ? '#ff6b6b' : '#888',
          textTransform: 'uppercase'
        }}>
          {isDebt ? '欠款' : '墊付'}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailView;