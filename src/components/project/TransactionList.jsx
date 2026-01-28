import React from 'react';
import { DollarSign, User, Calendar, FileText } from 'lucide-react';

// 小元件：單筆交易卡片
const TransactionCard = ({ transaction, onClick, getName }) => {
  const isDebt = transaction.type === 'debt';
  const formattedDate = new Date(transaction.date).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
  
  return (
    <div 
      className="band-card" 
      onClick={onClick} 
      style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '18px 20px', marginBottom: '12px',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: 44, height: 44, borderRadius: '14px', backgroundColor: isDebt ? 'rgba(255, 107, 107, 0.1)' : 'rgba(58, 143, 183, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <DollarSign size={20} color={isDebt ? '#ff6b6b' : 'var(--color-primary)'} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>{transaction.title || '未命名項目'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-sub)', fontSize: '12px', fontWeight: '600' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} strokeWidth={3} /><span>{getName(transaction.payer_id)}</span></div>
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

// 主元件：交易列表
const TransactionList = ({ transactions, loading, onEditTransaction, projectStatus, getName }) => {
  const showTitle = projectStatus === 'settling' || projectStatus === 'archived';

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      
      {showTitle && (
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
              // Active 狀態才允許編輯
              onClick={() => projectStatus === 'active' && onEditTransaction && onEditTransaction(t)} 
              getName={getName}
            />
          ))}
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed #333', padding: '80px 20px', borderRadius: '24px', textAlign: 'center' }}>
          <p style={{ color: '#555', fontSize: '15px' }}>尚無帳務，快去記一筆！</p>
        </div>
      )}
    </div>
  );
};

export default TransactionList;