import React from 'react';
import { Tag, Calendar, FileText } from 'lucide-react';

// 小元件：單筆交易卡片
const TransactionCard = ({ transaction, onClick, getName, categories }) => {
  const isDebt = transaction.type === 'debt';
  const formattedDate = new Date(transaction.date).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
  
  // 1. 查找分類並取得顏色
  const category = categories?.find(c => String(c.id) === String(transaction.category_id));
  
  // ★ 核心：取得分類底色，並處理拼寫相容性
  const catColor = category?.primary_color || category?.promary_color || '#888';
  
  // 2. 取得所有參與者的姓名列表
  const participantNames = transaction.transaction_participants?.map(tp => getName(tp.personnel_id)).join('、') || '無人分擔';

  return (
    <div 
      className="band-card" 
      onClick={onClick} 
      style={{ 
        padding: '24px 20px', 
        marginBottom: '12px',
        cursor: onClick ? 'pointer' : 'default',
        backgroundColor: '#1a1a1a',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}
    >
      {/* 第一層：標題與金額 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '22px', fontWeight: '900', color: '#fff', flex: 1, letterSpacing: '0.5px' }}>
          {transaction.title || '未命名項目'}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '900', 
            color: isDebt ? '#ff4d4f' : 'var(--color-primary)', 
            lineHeight: 1 
          }}>
            {Number(Math.abs(transaction.amount)).toLocaleString()}
          </div>
          <div style={{ 
            fontSize: '10px', 
            fontWeight: '900', 
            color: isDebt ? '#ff4d4f' : 'var(--color-primary)', 
            marginTop: '6px', 
            textTransform: 'uppercase' 
          }}>
            {isDebt ? '欠款' : '墊付'}
          </div>
        </div>
      </div>

      {/* 第二層：分類標籤 (★ 修正：透明底色 + 主題色文字/Icon) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          // ★ 修改 1：背景套用 15% 透明度 (Hex 後綴 26 代表約 15% 透明)
          backgroundColor: `${catColor}26`, 
          // ★ 修改 2：增加一點同色系邊框增加細節感
          border: `1px solid ${catColor}40`, 
          padding: '4px 12px', 
          borderRadius: '50px'
        }}>
          {/* ★ 修改 3：Icon 與文字皆改為主題色 */}
          <Tag size={12} strokeWidth={3} color={catColor} />
          <span style={{ fontSize: '12px', color: catColor, fontWeight: '800' }}>
            {category?.name || '未分類'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#666', fontWeight: '600' }}>
          <Calendar size={12} />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* 第三層：詳細人員關係 */}
      <div style={{ 
        backgroundColor: 'rgba(255,255,255,0.02)', 
        border: '1px solid rgba(255,255,255,0.05)',
        padding: '16px', 
        borderRadius: '14px',
        fontSize: '14px'
      }}>
        {isDebt ? (
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ color: '#ff4d4f', fontWeight: '900' }}>{getName(transaction.debtor_id)}</span>
            <span style={{ color: '#666', fontWeight: '700' }}>欠</span>
            <span style={{ color: '#fff', fontWeight: '900' }}>{getName(transaction.payer_id)}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <span style={{ color: '#888', fontSize: '12px', fontWeight: '700', marginRight: '8px' }}>由誰支付</span>
              <span style={{ color: '#fff', fontWeight: '900' }}>{getName(transaction.payer_id)}</span>
            </div>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', width: '100%' }} />
            <div>
              <span style={{ color: '#888', fontSize: '12px', fontWeight: '700', marginRight: '8px' }}>分擔人員</span>
              <span style={{ color: 'var(--color-text-sub)', fontWeight: '700', wordBreak: 'break-all', lineHeight: '1.6' }}>
                {participantNames}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 主元件：交易列表
const TransactionList = ({ transactions, loading, onEditTransaction, projectStatus, getName, categories }) => {
  const showTitle = projectStatus === 'settling' || projectStatus === 'archived';

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {showTitle && (
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#666', padding: '0 8px' }}>
            <FileText size={16} />
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>歷史帳務紀錄</span>
         </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0', color: '#444', fontWeight: '700' }}>讀取中...</div>
      ) : transactions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {transactions.map(t => (
            <TransactionCard 
              key={t.id} 
              transaction={t} 
              onClick={() => projectStatus === 'active' && onEditTransaction && onEditTransaction(t)} 
              getName={getName}
              categories={categories} 
            />
          ))}
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed #222', padding: '80px 20px', borderRadius: '24px', textAlign: 'center' }}>
          <p style={{ color: '#444', fontSize: '15px', fontWeight: '700' }}>尚無帳務紀錄</p>
        </div>
      )}
    </div>
  );
};

export default TransactionList;