import React, { useState } from 'react';
import { Menu, X, FolderKanban, LogOut, Plus } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const MainDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('projects');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="dashboard-container">
      {/* 1. 頂部導航欄 (Top Bar) */}
      <header className="top-bar">
        <button className="icon-btn" onClick={() => setSidebarOpen(true)}>
          <Menu size={24} color="var(--color-text-main)" />
        </button>
        <div className="top-bar-title">EasySplit</div>
        <div style={{ width: 24 }}></div> {/* 保持標題置中用的佔位 */}
      </header>

      {/* 2. 側邊選單 (Sidebar Overlay) */}
      <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
        <aside className="sidebar-content" onClick={(e) => e.stopPropagation()}>
          <div className="sidebar-header">
            <div className="user-profile">
              <div className="avatar">島</div>
              <div className="user-info">
                <span className="username">Andrew</span>
                <span className="role">虎小島管理員</span>
              </div>
            </div>
            <button className="icon-btn" onClick={() => setSidebarOpen(false)}>
              <X size={20} color="var(--color-text-sub)" />
            </button>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${currentView === 'projects' ? 'active' : ''}`}
              onClick={() => { setCurrentView('projects'); setSidebarOpen(false); }}
            >
              <FolderKanban size={20} />
              <span>我的專案</span>
            </button>
          </nav>

          <footer className="sidebar-footer">
            <button className="nav-item logout" onClick={handleLogout}>
              <LogOut size={20} />
              <span>登出</span>
            </button>
          </footer>
        </aside>
      </div>

      {/* 3. 主內容區 (Main Content) */}
      <main className="main-content">
        {currentView === 'projects' && (
          <div className="projects-view">
            <div className="section-header">
              <h2>進行中的專案</h2>
              <button className="add-project-btn">
                <Plus size={20} />
              </button>
            </div>
            
            {/* 這裡之後會放專案卡片 */}
            <div className="empty-state">
              <p>目前還沒有專案，點擊 + 開始分帳吧</p>
            </div>
          </div>
        )}
      </main>

      {/* 底部裝飾文字 */}
      <div className="fixed-footer-static">這群人真的很欠管</div>
    </div>
  );
};

export default MainDashboard;