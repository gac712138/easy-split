import React from 'react';
import { X, FolderKanban, LogOut, Settings } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, user, onSignOut, currentView, onNavigate }) => {
  return (
    /* 1. 遮罩層：維持地基 3.0 的 active 邏輯 */
    <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      
      {/* 2. 抽屜本體：強制 Flex 佈局以支援推力 */}
      <aside 
        className="sidebar-drawer" 
        style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* A. 頂部使用者區：強化品牌視覺感 */}
        <div style={{ padding: '48px 24px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="user-profile">
              <div 
                className="brand-logo-tinted" 
                style={{ 
                  width: 56, height: 56, borderRadius: '16px', marginBottom: '16px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontWeight: '900', fontSize: '24px', color: '#fff'
                }}
              >
                島
              </div>
              <div style={{ fontWeight: '900', fontSize: '20px', color: '#fff', marginBottom: '4px' }}>
                {user?.email?.split('@')[0] || 'Andrew'}
              </div>
              <div style={{ color: 'var(--color-text-sub)', fontSize: '12px', fontWeight: '600' }}>
                {user?.email}
              </div>
            </div>
            
            {/* 關閉按鈕：對齊地基按鈕樣式 */}
            <button onClick={onClose} className="hamburger-btn" style={{ marginTop: '-8px' }}>
              <X size={24} color="var(--color-text-sub)"/>
            </button>
          </div>
        </div>

        {/* B. ★ 核心物理修正：彈性導航區塊 (佔據所有剩餘空間) ★ */}
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
          >
            <Settings size={20} />
            <span>系統設定</span>
          </button>
        </nav>

        {/* C. ★ 底部登出區域：物理性貼齊最下方 ★ */}
        <div style={{ 
          padding: '16px 16px 40px', // 為手機底部安全區 (Safe Area) 留白
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