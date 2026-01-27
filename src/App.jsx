import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabaseClient';
import AuthView from './views/AuthView';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SettingsView from './views/SettingsView';
import ProjectDetailView from './views/ProjectDetailView'; 
import CreateProjectModal from './components/CreateProjectModal';
import AddTransactionModal from './components/AddTransactionModal'; 
import ConfirmModal from './components/ConfirmModal';
import './App.css';

function App() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState('projects'); 
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Sidebar 狀態
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  const refreshGlobalData = useCallback(async (userId) => {
    if (!userId) return;
    setIsDataLoading(true);
    try {
      const [projRes, persRes, themeRes] = await Promise.all([
        supabase.from('projects').select(`*, project_members(personnel(*))`).eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('personnel').select('*').eq('user_id', userId).order('sort_order', { ascending: true }),
        supabase.from('user_settings').select('key, value').eq('user_id', userId)
      ]);
      if (themeRes.data) {
        themeRes.data.forEach(s => {
          document.documentElement.style.setProperty(`--color-${s.key.replace('theme_', '')}`, s.value);
        });
      }
      if (projRes.data) setProjects(projRes.data);
      if (persRes.data) setPersonnel(persRes.data);
    } catch (err) { console.error("預載資料失敗:", err); } 
    finally { setIsDataLoading(false); }
  }, []);

  useEffect(() => { if (user?.id) refreshGlobalData(user.id); }, [user?.id, refreshGlobalData]);

  if (!user) return <AuthView />;

  return (
    <div className="app-main-layout">
      {/* 1. Sidebar 遮罩：點擊空白處關閉 Sidebar */}
      <div 
        className={`sidebar-overlay ${isMenuOpen ? 'active' : ''}`} 
        onClick={() => setIsMenuOpen(false)} 
      />

      {/* 2. 側邊欄：現在是抽屜式 (Fixed) */}
      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        user={user} 
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setSelectedProject(null);
          setIsMenuOpen(false); // 導航後自動收合
        }} 
        onSignOut={() => setIsLogoutConfirmOpen(true)} 
      />

      {/* 3. 主內容區：始終保持 100% 寬度，不受 Sidebar 擠壓 */}
      <main className="content-area-wrapper">
        {currentView === 'projects' ? (
          !selectedProject ? (
            <Dashboard 
              user={user} projects={projects || []} loading={isDataLoading} 
              onOpenMenu={() => setIsMenuOpen(true)} 
              onOpenCreate={() => setIsCreateModalOpen(true)} 
              onSelectProject={(p) => setSelectedProject(p)} 
              onRefresh={() => refreshGlobalData(user.id)}
            />
          ) : (
            <ProjectDetailView 
              project={selectedProject} 
              onBack={() => setSelectedProject(null)} 
              onAddTransaction={() => setIsAddTransactionOpen(true)} 
            />
          )
        ) : (
          <SettingsView onOpenMenu={() => setIsMenuOpen(true)} user={user} />
        )}
      </main>

      <CreateProjectModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} user={user} personnel={personnel} onRefresh={() => refreshGlobalData(user.id)} />

      {selectedProject && (
        <AddTransactionModal
          isOpen={isAddTransactionOpen}
          onClose={() => setIsAddTransactionOpen(false)}
          project={selectedProject}
          personnel={personnel}
          user={user}
          onRefresh={() => refreshGlobalData(user.id)}
        />
      )}

      <ConfirmModal open={isLogoutConfirmOpen} onConfirm={async () => { await signOut(); setIsLogoutConfirmOpen(false); }} onCancel={() => setIsLogoutConfirmOpen(false)} />
    </div>
  );
}

export default App;