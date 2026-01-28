
import React from 'react';
import { ChevronLeft, Share2, Users, Plus } from 'lucide-react';
import { message } from 'antd';

const ProjectHeader = ({ project, onBack, onInvite, onOpenPersonnel, onAddTransaction }) => {
  
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
    <header className="navbar" style={{ flexShrink: 0, backgroundColor: 'var(--color-bg-main)', position: 'relative', zIndex: 10 }}>
      <button onClick={onBack} className="hamburger-btn">
        <ChevronLeft size={24} color="var(--color-text-main)"/>
      </button>
      
      <span className="nav-brand" style={{ fontSize: '18px', fontWeight: '800' }}>
        {project.name} 
        {project.status === 'settling' && (
          <span style={{ fontSize: '12px', background: 'var(--color-primary)', color: '#000', padding: '2px 8px', borderRadius: '10px', marginLeft: '8px', verticalAlign: 'middle' }}>
            結算中
          </span>
        )}
        {project.status === 'archived' && (
          <span style={{ fontSize: '12px', background: '#333', color: '#ccc', padding: '2px 8px', borderRadius: '10px', marginLeft: '8px', verticalAlign: 'middle' }}>
            已歸檔
          </span>
        )}
      </span>
      
      <div style={{ display: 'flex', gap: '8px' }}>
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