import React from 'react';
import { Calculator, Archive, CheckCircle, RotateCcw, Check, MessageCircle } from 'lucide-react';

const SettlementList = ({ project, settlements, isOwner, onItemClick, onCancel, onFinish, getName }) => {
  const safeSettlements = Array.isArray(settlements) ? settlements : [];
  const allCleared = safeSettlements.length > 0 && safeSettlements.every(s => s.is_cleared);

  return (
    <div style={{ paddingTop: '20px', marginBottom: '40px' }}>
      {/* 標題與進度 */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: project.status === 'archived' ? '#4caf50' : 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px' }}>
            {project.status === 'archived' ? <Archive /> : <Calculator />}
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#fff' }}>
          {project.status === 'archived' ? '專案已結案' : '專案結算中'}
        </h2>
      </div>

      {/* 清單 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {safeSettlements.map((item) => (
          <div 
            key={item.id}
            onClick={() => (isOwner && project.status === 'settling') && onItemClick(item)}
            style={{ 
              display: 'flex', flexDirection: 'column', padding: '16px 20px', borderRadius: '16px',
              background: item.is_cleared ? 'rgba(76, 175, 80, 0.05)' : '#1e1e1e',
              border: item.is_cleared ? '1px solid #4caf50' : '1px solid #333',
              transition: '0.2s', cursor: (isOwner && project.status === 'settling') ? 'pointer' : 'default'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ 
                  width: '24px', height: '24px', borderRadius: '50%', border: item.is_cleared ? 'none' : '2px solid #666',
                  background: item.is_cleared ? '#4caf50' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {item.is_cleared && <CheckCircle size={16} color="#fff" />}
                </div>

                {/* ★ 修復：刪除線對齊邏輯 ★ */}
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ color: item.is_cleared ? '#666' : '#fff', fontSize: '16px', fontWeight: '700' }}>
                    {getName(item.from_personnel_id)}
                  </span>
                  <span style={{ color: '#666', fontSize: '12px' }}>付給</span>
                  <span style={{ color: item.is_cleared ? '#666' : '#fff', fontSize: '16px', fontWeight: '700' }}>
                    {getName(item.to_personnel_id)}
                  </span>
                  
                  {/* 自定義刪除線：確保絕對垂直置中 */}
                  {item.is_cleared && (
                    <div style={{ 
                      position: 'absolute', left: '-4px', right: '-4px', top: '55%', 
                      height: '1.5px', background: 'rgba(255,255,255,0.3)', pointerEvents: 'none' 
                    }} />
                  )}
                </div>
              </div>
              
              <div style={{ position: 'relative', fontWeight: '900', color: item.is_cleared ? '#4caf50' : 'var(--color-primary)', fontSize: '16px' }}>
                ${Number(item.amount).toLocaleString()}
                {item.is_cleared && (
                  <div style={{ position: 'absolute', left: '-2px', right: '-2px', top: '50%', height: '1.5px', background: 'rgba(76, 175, 80, 0.5)' }} />
                )}
              </div>
            </div>
            
            {item.remark && (
              <div style={{ marginTop: '8px', marginLeft: '40px', fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageCircle size={14} /> <span>{item.remark}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 按鈕區 */}
      {isOwner && project.status === 'settling' && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button onClick={onCancel} style={{ background: 'none', border: '1px solid #ff6b6b', color: '#ff6b6b', padding: '12px 20px', borderRadius: '12px', fontWeight: 'bold' }}>
            <RotateCcw size={16} style={{ marginRight: '8px' }} /> 取消結算
          </button>

          {allCleared && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onFinish(); // ★ 確保這裡有被執行
              }}
              style={{ background: 'var(--color-primary)', border: 'none', color: '#000', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(58,143,183,0.3)' }}
            >
              <Check size={18} /> 完成並歸檔
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SettlementList;