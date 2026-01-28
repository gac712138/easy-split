import React from 'react';
import { ChevronLeft, Share2, Users, Plus } from 'lucide-react';
import { message } from 'antd';

const ProjectHeader = ({ project, onBack, onOpenPersonnel, onAddTransaction }) => {
  
  const handleCopyInvite = () => {
    if (!project.invite_code) {
      message.error('無邀請碼');
      return;
    }
    const inviteLink = `${window.location.origin}${window.location.pathname}?code=${project.invite_code}`;
    navigator.clipboard.writeText(inviteLink)
      .then(() => message.success('已複製邀請連結'))
      .catch(() => message.error('複製失敗'));
  };

  return (
    <header className="navbar" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      flexShrink: 0, 
      backgroundColor: 'var(--color-bg-main)', 
      position: 'relative', 
      zIndex: 10,
      padding: '0 12px',
      height: '60px',
      overflow: 'hidden' /* 防止任何內容溢出 header */
    }}>
      {/* 左側按鈕：固定寬度 */}
      <div style={{ flexShrink: 0 }}>
        <button onClick={onBack} className="hamburger-btn" style={{ display: 'flex', alignItems: 'center' }}>
          <ChevronLeft size={24} color="var(--color-text-main)"/>
        </button>
      </div>
      
      {/* 中間標題：佔滿剩餘空間並強制截斷 */}
      <div style={{ 
        flex: 1, 
        minWidth: 0, // ★ 必須設為 0，否則 flex 容器會被長文字撐開
        padding: '0 8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <span style={{ 
          fontSize: '18px', 
          fontWeight: '800',
          color: 'var(--color-text-main)',
          whiteSpace: 'nowrap',       // ★ 強制不換行
          overflow: 'hidden',          // ★ 溢出隱藏
          textOverflow: 'ellipsis',    // ★ 顯示 ...
          display: 'block'             // ★ 確保是區塊元素
        }}>
          {project.name} 
        </span>
      </div>
      
      {/* 右側按鈕組：固定寬度，不准收縮 */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        flexShrink: 0, 
        alignItems: 'center' 
      }}>
        <button onClick={handleCopyInvite} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Share2 size={20} color="#fff" />
        </button>
        <button onClick={onOpenPersonnel} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Users size={20} color="#fff" />
        </button>
        
        {project.status === 'active' && (
          <button onClick={onAddTransaction} style={{ background: 'var(--color-primary)', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Plus size={20} color="#fff" />
          </button>
        )}
      </div>
    </header>
  );
};

export default ProjectHeader;