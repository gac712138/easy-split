import React from 'react';
import { Calculator, Wallet } from 'lucide-react';

const DebtOverviewCard = ({ calculatedSettlements, isOwner, onStartSettlement, getName }) => {
  if (calculatedSettlements.length === 0) {
    return (
      <div className="band-card" style={{ padding: '32px', textAlign: 'center', opacity: 0.6 }}>
        <div style={{ color: 'var(--color-text-sub)', fontSize: '15px', fontWeight: '700' }}>
          目前無任何債務，帳目平衡中
        </div>
      </div>
    );
  }

  return (
    <div className="band-card" style={{ padding: '24px', marginBottom: '20px' }}>
      {/* Header 區域 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Wallet size={20} color="var(--color-primary)" />
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#fff' }}>目前債務概況</h3>
        </div>

        {/* ★ 鋼鐵純色按鈕：移除螢光效果 */}
        {isOwner && (
          <button 
            onClick={onStartSettlement}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              borderRadius: '50px',
              backgroundColor: 'var(--color-primary)', // 純色主題藍
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.1)', // 極細微白邊增加立體感
              fontSize: '14px',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: 'none', // ★ 徹底移除螢光陰影
              transition: 'all 0.2s ease'
            }}
            onPointerDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.96)';
              e.currentTarget.style.backgroundColor = 'rgba(58, 143, 183, 0.8)'; // 按下時變暗
            }}
            onPointerUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = 'var(--color-primary)';
            }}
          >
            <Calculator size={16} />
            <span>開始結算</span>
          </button>
        )}
      </div>

      {/* 債務清單區域 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {calculatedSettlements.map((item, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '14px 18px',
            background: 'rgba(255, 255, 255, 0.02)', // 更暗的背景
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-text-main)', fontWeight: '700', fontSize: '15px' }}>{getName(item.from)}</span>
              <span style={{ color: 'var(--color-text-sub)', fontSize: '12px' }}>需付</span>
              <span style={{ color: 'var(--color-primary)', fontWeight: '800', fontSize: '15px' }}>{getName(item.to)}</span>
            </div>
            <div style={{ fontSize: '17px', fontWeight: '900', color: '#fff' }}>
              <span style={{ fontSize: '12px', marginRight: '4px', opacity: 0.5 }}>NT$</span>
              {item.amount.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebtOverviewCard;