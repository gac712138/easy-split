import React from 'react';
import { X, FolderKanban, LogOut, Settings } from 'lucide-react';

// ★ 接收來自 App.jsx 的 showBadge 屬性
const Sidebar = ({ isOpen, onClose, user, onSignOut, currentView, onNavigate, showBadge }) => {
  
  // ★ 注入邏輯：優先讀取設定好的暱稱，沒有才用 Email
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || '使用者';
  // ★ 注入邏輯：取名字首字當頭像
  const avatarLabel = displayName.charAt(0).toUpperCase();

  return (
    <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <aside 
        className="sidebar-drawer" 
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }} // 保持你的 100dvh 設定
      >
        
        {/* A. 上方使用者區 */}
        <div style={{ padding: '48px 24px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="user-profile">
              {/* 大頭貼 */}
              <div style={{ 
                width: 56, height: 56, borderRadius: '16px', 
                backgroundColor: 'var(--color-primary)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontWeight: '900', fontSize: '24px', marginBottom: '16px',
                color: '#ffffff',
                boxShadow: '0 8px 16px rgba(58, 143, 183, 0.3)'
              }}>
                {avatarLabel}
              </div>
              
              {/* 顯示名稱 */}
              <div style={{ fontWeight: '900', fontSize: '20px', color: '#fff' }}>
                {displayName}
              </div>
              
              {/* Email */}
              <div style={{ color: 'var(--color-text-sub)', fontSize: '12px', fontWeight: '600' }}>
                {user?.email}
              </div>
            </div>
            
            <button onClick={onClose} className="hamburger-btn" style={{ marginTop: '-8px' }}>
              <X size={24} color="var(--color-text-sub)"/>
            </button>
          </div>
        </div>

        {/* B. 彈性導航區塊 */}
        <nav style={{ 
          flex: 1, 
          padding: '24px 16px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px',
          overflowY: 'auto' 
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
            style={{ position: 'relative' }} // ★ 為了讓紅點能相對於按鈕定位
          >
            <Settings size={20} />
            <span>系統設定</span>
            
            {/* ★ 系統設定紅點提醒 */}
            {showBadge && (
              <span style={{ 
                position: 'absolute', 
                right: '16px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                width: '8px', 
                height: '8px', 
                background: '#ff6b6b', 
                borderRadius: '50%',
                border: '2px solid var(--color-bg)',
                boxShadow: '0 0 8px rgba(255, 107, 107, 0.4)'
              }} />
            )}
          </button>
        </nav>

        {/* C. 底部登出區域 */}
        <div style={{ 
          padding: '16px 16px 40px', 
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'rgba(255,255,255,0.01)' 
        }}>
          <button 
            onClick={onSignOut} 
            className="sidebar-item" 
            style={{ color: '#ff6b6b', opacity: 0.9 }}
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