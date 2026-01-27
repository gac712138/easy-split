import React from 'react';
import { X, FolderKanban, LogOut, Settings } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, user, onSignOut, currentView, onNavigate }) => {
  return (
    <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <aside className="sidebar-drawer" onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '40px 20px' }}>
          {/* 使用者資訊區塊 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div className="user-profile">
              <div style={{ 
                width: 45, height: 45, borderRadius: '50%', 
                backgroundColor: 'var(--color-primary)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontWeight: 'bold', fontSize: '20px', marginBottom: '10px' 
              }}>島</div>
              <div style={{ fontWeight: 'bold', color: 'var(--color-text-main)' }}>Andrew</div>
              <div style={{ color: 'var(--color-text-sub)', fontSize: '12px' }}>{user?.email}</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
              <X size={24}/>
            </button>
          </div>

          {/* 導覽選單 */}
          <nav>
            {/* 1. 我的專案 */}
            <button 
              className={`sidebar-item ${currentView === 'projects' ? 'active' : ''}`}
              onClick={() => { onNavigate('projects'); onClose(); }}
            >
              <FolderKanban size={20} />
              <span>我的專案</span>
            </button>

            {/* 2. 系統設定 - 新增功能 */}
            <button 
              className={`sidebar-item ${currentView === 'settings' ? 'active' : ''}`}
              onClick={() => { onNavigate('settings'); onClose(); }}
            >
              <Settings size={20} />
              <span>系統設定</span>
            </button>
          </nav>
        </div>

        {/* 底部登出按鈕 */}
        <div className="sidebar-bottom">
          <button onClick={onSignOut} className="sidebar-item" style={{ color: 'var(--color-text-muted)' }}>
            <LogOut size={20} />
            <span>登出帳號</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;