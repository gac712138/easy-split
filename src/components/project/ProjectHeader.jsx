import React from 'react';
import { ChevronLeft, Users, Plus } from 'lucide-react';
import { message } from 'antd';

const ProjectHeader = ({ project, onBack, onOpenPersonnel, onAddTransaction, personnel = [] }) => {
  
  // 判斷是否只有自己一人 (成員數 <= 1)
  const isAlone = personnel.length <= 1;

  // 攔截新增帳務按鈕：僅在 Active 且有其他成員時允許
  const handleAddClick = () => {
    if (isAlone) {
      message.warning('請先邀請成員再開始記帳');
      onOpenPersonnel(); 
      return;
    }
    onAddTransaction();
  };

  return (
    <header className="navbar" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      flexShrink: 0, 
      backgroundColor: 'var(--color-bg-main)', 
      height: '60px',
      padding: '0 12px',
      position: 'relative', 
      zIndex: 10,
      overflow: 'hidden' 
    }}>
      {/* 左側返回 */}
      <div style={{ flexShrink: 0 }}>
        <button onClick={onBack} className="hamburger-btn">
          <ChevronLeft size={24} color="var(--color-text-main)"/>
        </button>
      </div>
      
      {/* 中間標題：自動截斷 */}
      <div style={{ flex: 1, minWidth: 0, padding: '0 8px' }}>
        <span style={{ 
          fontSize: '18px', 
          fontWeight: '800', 
          display: 'block',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {project.name} 
        </span>
      </div>
      
      {/* 右側功能組：僅保留人員管理與新增帳務 */}
      <div style={{ display: 'flex', gap: '10px', flexShrink: 0, alignItems: 'center' }}>
        
        {/* 人員按鈕 + 紅點提醒 */}
        <button 
          onClick={onOpenPersonnel} 
          style={{ 
            background: 'rgba(255,255,255,0.1)', 
            border: 'none', 
            borderRadius: '12px', 
            padding: '8px', 
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <Users size={20} color="#fff" />
          {isAlone && (
            <span style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '10px',
              height: '10px',
              backgroundColor: '#ff4d4f',
              borderRadius: '50%',
              border: '2px solid var(--color-bg-main)',
              boxShadow: '0 0 4px rgba(255, 77, 79, 0.5)'
            }} />
          )}
        </button>
        
        {/* 只有在活躍狀態顯示新增按鈕 */}
        {project.status === 'active' && (
          <button 
            onClick={handleAddClick}
            style={{ 
              background: isAlone ? 'rgba(255,255,255,0.05)' : 'var(--color-primary)', 
              border: 'none', 
              borderRadius: '12px', 
              padding: '8px', 
              cursor: 'pointer',
              opacity: isAlone ? 0.5 : 1
            }}
          >
            <Plus size={20} color="#fff" />
          </button>
        )}
      </div>
    </header>
  );
};

export default ProjectHeader;