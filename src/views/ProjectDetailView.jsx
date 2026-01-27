import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, DollarSign, User, Tag } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';

const ProjectDetailView = ({ project, onBack, onAddTransaction }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. 修正查詢語法：改用欄位名稱 (!payer_id) 作為 Hint，避免外鍵名稱錯誤
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

  // 2. 計算總支出邏輯
  const totalExpense = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="app-main-layout">
      <header className="navbar">
        <button onClick={onBack} className="hamburger-btn">
          <ChevronLeft size={24} color="var(--color-text-main)"/>
        </button>
        <span className="nav-brand">{project.name}</span>
        <button 
          onClick={onAddTransaction} 
          className="icon-btn-primary"
          style={{ background: 'var(--color-primary)', borderRadius: '12px', padding: '6px' }}
        >
          <Plus size={20} color="#fff" />
        </button>
      </header>

      <main className="content-area">
        {/* 專案總計卡片 */}
        <div className="project-summary-card">
          <div className="summary-item">
            <span className="label">總支出</span>
            <span className="value">NT$ {totalExpense.toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', color: 'var(--color-text-main)', margin: 0 }}>帳務紀錄</h2>
          <span style={{ fontSize: '12px', color: 'var(--color-text-sub)' }}>共 {transactions.length} 筆</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-sub)' }}>讀取中...</div>
        ) : transactions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transactions.map(t => (
              <TransactionCard key={t.id} transaction={t} />
            ))}
          </div>
        ) : (
          <div className="empty-state-card" style={{ padding: '60px' }}>
            <Tag size={40} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <p>尚無帳務紀錄，點擊右上角新增</p>
          </div>
        )}
      </main>
    </div>
  );
};

/**
 * 內部組件：交易卡片 - 強化「欠款」與「墊付」區分
 */
const TransactionCard = ({ transaction }) => {
  const isDebt = transaction.type === 'debt';

  return (
    <div className="transaction-pill-card">
      <div className="card-left">
        <div className="category-icon-bg" style={{ backgroundColor: isDebt ? 'rgba(255, 107, 107, 0.1)' : 'rgba(58, 143, 183, 0.1)' }}>
          <DollarSign size={18} color={isDebt ? '#ff6b6b' : 'var(--color-primary)'} />
        </div>
        <div className="info">
          <span className="title">{transaction.title || '未命名項目'}</span>
          <div className="sub-info">
            <User size={12} />
            <span>{transaction.payer?.name || '未知人員'} {isDebt ? '債權人' : '付款'}</span>
            <span className="dot">•</span>
            <span>{transaction.date}</span>
          </div>
        </div>
      </div>
      <div className="card-right">
        {/* 欠款顯示負號並變紅 */}
        <span className={`amount ${transaction.type}`} style={{ color: isDebt ? '#ff6b6b' : '#fff' }}>
          {isDebt ? '- ' : ''}NT$ {Number(transaction.amount).toLocaleString()}
        </span>
        <div className={`type-tag ${transaction.type}`} style={{ 
          backgroundColor: isDebt ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 255, 255, 0.05)',
          color: isDebt ? '#ff6b6b' : '#888'
        }}>
          {isDebt ? '欠款' : '墊付'}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailView;