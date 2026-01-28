import React from 'react';
import { X, FolderKanban, LogOut, Settings } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, user, onSignOut, currentView, onNavigate }) => {
  return (
    <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <aside className="sidebar-drawer" onClick={(e) => e.stopPropagation()}>
        
        {/* A. 上方使用者資訊區：維持品牌感 */}
        <div style={{ padding: '40px 24px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="user-profile">
              <div style={{ 
                width: 56, height: 56, borderRadius: '16px', 
                backgroundColor: 'var(--color-primary)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontWeight: '900', fontSize: '24px', marginBottom: '16px',
                color: '#ffffff',
                boxShadow: '0 8px 16px rgba(58, 143, 183, 0.3)' // 旗艦級陰影
              }}>
                島
              </div>
              <div style={{ fontWeight: '900', fontSize: '20px', color: '#fff' }}>
                {user?.email?.split('@')[0] || 'Andrew'}
              </div>
              <div style={{ color: 'var(--color-text-sub)', fontSize: '12px', fontWeight: '600' }}>
                {user?.email}
              </div>
            </div>
            <button onClick={onClose} className="hamburger-btn" style={{ marginTop: '-8px' }}>
              <X size={24} color="var(--color-text-sub)"/>
            </button>
          </div>
        </div>

        {/* B. ★ 核心修正：中間導航選單 (使用 flex: 1 撐開空間) ★ */}
        <nav style={{ 
          flex: 1, 
          padding: '24px 16px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          overflowY: 'auto' // 防止選項過多時溢出
        }}>
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

        {/* C. ★ 底部登出區域：物理性貼齊最下方 ★ */}
        <div style={{ 
          padding: '16px 16px 40px', 
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'rgba(255,255,255,0.02)' 
        }}>
          <button 
            onClick={onSignOut} 
            className="sidebar-item" 
            style={{ color: '#ff6b6b', transition: '0.2s' }}
          >
            <LogOut size={20} />
            <span style={{ fontWeight: '900' }}>登出系統</span>
          </button>
        </div>

      </aside>
    </div>
  );
};

export default Sidebar;