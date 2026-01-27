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

  // 1. 載入並注入 KV 配色設定
  useEffect(() => {
    if (!user?.id) return; // 安全檢查，解決 image_814994.png 的崩潰

    const loadTheme = async () => {
      const { data } = await supabase.from('user_settings').select('key, value').eq('user_id', user.id);
      if (data) {
        data.forEach(setting => {
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
      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        user={user} 
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)} 
        onSignOut={() => setIsLogoutConfirmOpen(true)} 
      />

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

      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
      />

      <ConfirmModal
        open={isLogoutConfirmOpen}
        onConfirm={async () => { await signOut(); setIsLogoutConfirmOpen(false); }}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />
    </div>
  );
}

export default App;