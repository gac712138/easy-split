import React from 'react';
import { Calculator, Archive, CheckCircle, RotateCcw, Check, MessageCircle } from 'lucide-react';

const SettlementList = ({ project, settlements, isOwner, onItemClick, onCancel, onFinish, getName }) => {
  
  // 安全性檢查：確保 settlements 是陣列
  const safeSettlements = Array.isArray(settlements) ? settlements : [];
  
  // 計算是否全部已結清
  const allCleared = safeSettlements.length > 0 && safeSettlements.every(s => s.is_cleared);

  return (
    <div style={{ paddingTop: '20px', marginBottom: '40px' }}>
      
      {/* 1. 標題區塊 */}
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

      {/* 2. 清單區塊 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {safeSettlements.length > 0 ? (
          safeSettlements.map((item) => (
            <div 
              key={item.id}
              // 只有 Owner 且在結算狀態可以點擊
              onClick={() => {
                if (isOwner && project.status === 'settling') {
                  onItemClick(item);
                }
              }}
              style={{ 
                display: 'flex', flexDirection: 'column',
                padding: '16px 20px', borderRadius: '16px',
                background: item.is_cleared ? 'rgba(76, 175, 80, 0.1)' : '#1e1e1e',
                border: item.is_cleared ? '1px solid #4caf50' : '1px solid #333',
                opacity: item.is_cleared ? 0.8 : 1,
                cursor: (isOwner && project.status === 'settling') ? 'pointer' : 'default',
                transition: '0.2s',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ 
                    width: '24px', height: '24px', borderRadius: '50%', 
                    border: item.is_cleared ? 'none' : '2px solid #666',
                    background: item.is_cleared ? '#4caf50' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
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
              
              {/* 顯示備註 (如果有) */}
              {item.remark && (
                <div style={{ marginTop: '8px', marginLeft: '40px', fontSize: '13px', color: '#888', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <MessageCircle size={14} style={{ marginTop: '2px' }} />
                  <span>{item.remark}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', color: '#555', padding: '20px' }}>
            沒有需要結算的款項
          </div>
        )}
      </div>

      {/* 3. 底部操作區 (Cancel & Finish) */}
      {isOwner && project.status === 'settling' && (
        <div style={{ 
          paddingBottom: '20px', borderBottom: '1px solid #333', 
          display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap'
        }}>
          {/* 取消按鈕 */}
          <button 
            onClick={onCancel}
            style={{ 
              background: 'none', border: '1px solid #ff6b6b', color: '#ff6b6b', 
              padding: '12px 20px', borderRadius: '12px', fontWeight: 'bold', 
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px'
            }}
          >
            <RotateCcw size={16} /> 取消結算
          </button>

          {/* ★ 只有全勾選才會長出來的「完成結算」按鈕 */}
          {allCleared && (
            <button 
              onClick={onFinish}
              className="band-btn-primary" 
              style={{ 
                padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', 
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
                border: 'none', color: '#000', background: 'var(--color-primary)'
              }}
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