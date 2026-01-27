import React from 'react';
import { X, FolderKanban, LogOut, Settings } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, user, onSignOut, currentView, onNavigate }) => {
  return (
    // 使用地基中的 .sidebar-overlay 與 .active
    <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <aside className="sidebar-drawer" onClick={(e) => e.stopPropagation()}>
        
        {/* A. 上方使用者資訊區 */}
        <div style={{ padding: '40px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="user-profile">
              <div style={{ 
                width: 56, height: 56, borderRadius: '16px', 
                backgroundColor: 'var(--color-primary)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontWeight: 'bold', fontSize: '24px', marginBottom: '12px',
                color: '#ffffff'
              }}>島</div>
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{user?.email?.split('@')[0] || 'Andrew'}</div>
              <div style={{ color: 'var(--color-text-sub)', fontSize: '12px' }}>{user?.email}</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-main)', cursor: 'pointer' }}>
              <X size={24}/>
            </button>
          </div>
        </div>

        {/* B. 中間導航選單 */}
        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button 
            className={`sidebar-item ${currentView === 'projects' ? 'active' : ''}`}
            onClick={() => { onNavigate('projects'); onClose(); }}
          >
            <FolderKanban size={20} />
            <span>我的專案</span>
          </button>

          <button 
            className={`sidebar-item ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => { onNavigate('settings'); onClose(); }}
          >
            <Settings size={20} />
            <span>系統設定</span>
          </button>
        </nav>

        {/* C. 底部登出區域 */}
        <div style={{ padding: '16px', marginBottom: '20px' }}>
          <button onClick={onSignOut} className="sidebar-item" style={{ opacity: 0.8 }}>
            <LogOut size={20} />
            <span>登出系統</span>
          </button>
        </div>

      </aside>
    </div>
  );
};

export default Sidebar;