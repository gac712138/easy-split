import React from 'react';
import { Wallet, Calculator } from 'lucide-react';

const DebtOverviewCard = ({ calculatedSettlements, isOwner, onStartSettlement, getName }) => {
  return (
    <div className="band-card" style={{ background: 'linear-gradient(135deg, #1e1e1e 0%, #141414 100%)', padding: '24px 20px', marginBottom: '32px', border: '1px solid #333' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #333', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wallet size={20} color="var(--color-primary)" />
          <span style={{ color: '#fff', fontSize: '16px', fontWeight: '800' }}>目前債務概況</span>
        </div>
        {isOwner && calculatedSettlements.length > 0 && (
          <button onClick={onStartSettlement} style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(58, 143, 183, 0.2)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
  );
};

export default DebtOverviewCard;