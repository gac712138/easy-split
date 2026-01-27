import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabaseClient';
import AuthView from './views/AuthView';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SettingsView from './views/SettingsView'; 
import CreateProjectModal from './components/CreateProjectModal';
import ConfirmModal from './components/ConfirmModal';
import './App.css';

function App() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState('projects'); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // 1. 核心：動態注入 KV 配色設定
  useEffect(() => {
    if (!user?.id) return; 

    const loadTheme = async () => {
      const { data } = await supabase.from('user_settings').select('key, value').eq('user_id', user.id);
      if (data) {
        data.forEach(setting => {
          // 將 key (如 theme_primary) 轉換為 CSS 變數 (--color-primary)
          const cssVar = `--color-${setting.key.replace('theme_', '')}`;
          document.documentElement.style.setProperty(cssVar, setting.value);
        });
      }
    };
    loadTheme();
  }, [user?.id]);

  if (!user) return <AuthView />;

  return (
    <div className="app-main-layout">
      {/* 2. 側邊欄：傳遞 user 與導航狀態 */}
      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        user={user} 
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)} 
        onSignOut={() => setIsLogoutConfirmOpen(true)} 
      />

      {/* 3. 主內容區：視圖切換 */}
      <main className="content-area-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentView === 'projects' ? (
          <Dashboard 
            onOpenMenu={() => setIsMenuOpen(true)} 
            onOpenCreate={() => setIsCreateModalOpen(true)} 
          />
        ) : (
          <SettingsView 
            onOpenMenu={() => setIsMenuOpen(true)} 
            user={user} 
          />
        )}
      </main>

      {/* 4. 彈出層 */}
      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
      />

      <ConfirmModal
        open={isLogoutConfirmOpen}
        title="確認要登出嗎？"
        content="登出後需要重新登入才能管理分帳。"
        onConfirm={async () => { await signOut(); setIsLogoutConfirmOpen(false); }}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />
    </div>
  );
}

export default App;