import React, { useState } from 'react';
import { X, FolderKanban, LogOut, Settings } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

const Sidebar = ({ isOpen, onClose, user, onSignOut, currentView, onNavigate }) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleNav = (view) => {
    onNavigate(view);
    onClose();
  };

  return (
    <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <aside 
        className="sidebar-drawer" 
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'flex', flexDirection: 'column' }} // 開啟 Flex 佈局
      >
        {/* 1. 上方使用者資訊區 */}
        <div style={{ padding: '32px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="user-profile">
              <div style={{ 
                width: 56, height: 56, borderRadius: '16px', 
                backgroundColor: 'var(--color-primary)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontWeight: 'bold', fontSize: '24px', marginBottom: '12px',
                color: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>島</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px', color: 'var(--color-text-main)' }}>Andrew</div>
              <div style={{ color: 'var(--color-text-sub)', fontSize: '12px' }}>{user?.email}</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-main)', cursor: 'pointer' }}>
              <X size={24}/>
            </button>
          </div>
        </div>

        {/* 2. 中間導航區：縮短圖文間距 */}
        <div style={{ padding: '24px 16px' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            
            <button 
              className={`sidebar-item ${currentView === 'projects' ? 'active' : ''}`}
              onClick={() => handleNav('projects')}
              style={{ 
                justifyContent: 'flex-start', // 修正：不要用 space-between
                gap: '12px'                  // 修正：縮短間距
              }}
            >
              <FolderKanban size={20} color="var(--color-text-main)" />
              <span style={{ color: 'var(--color-text-main)' }}>我的專案</span>
            </button>

            <button 
              className={`sidebar-item ${currentView === 'settings' ? 'active' : ''}`}
              onClick={() => handleNav('settings')}
              style={{ 
                justifyContent: 'flex-start', // 修正：不要用 space-between
                gap: '12px'                  // 修正：縮短間距
              }}
            >
              <Settings size={20} color="var(--color-text-main)" />
              <span style={{ color: 'var(--color-text-main)' }}>系統設定</span>
            </button>

          </nav>
        </div>

        {/* 3. 底部登出區：強制推至最下方 */}
        <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
          <button 
            onClick={() => setIsLogoutModalOpen(true)} 
            className="sidebar-item" 
            style={{ 
              justifyContent: 'flex-start', 
              gap: '12px',
              color: 'var(--color-text-main)' 
            }}
          >
            <LogOut size={20} color="var(--color-text-main)" />
            <span style={{ color: 'var(--color-text-main)' }}>登出系統</span>
          </button>
        </div>

        <ConfirmModal
          open={isLogoutModalOpen}
          onCancel={() => setIsLogoutModalOpen(false)}
          onConfirm={() => { setIsLogoutModalOpen(false); onSignOut(); }}
          title="確定要登出嗎？"
          content="登出後下次需要重新輸入密碼。"
          okText="登出"
          isDanger={true}
        />
      </aside>
    </div>
  );
};

export default Sidebar;