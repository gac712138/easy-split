import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabaseClient';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AuthView from './views/AuthView';
import ProjectDetailView from './views/ProjectDetailView'; 
import SettingsView from './views/SettingsView'; 
import CreateProjectModal from './components/CreateProjectModal';
import AddTransactionModal from './components/AddTransactionModal'; 
import ConfirmModal from './components/ConfirmModal';
import EditProjectModal from './components/EditProjectModal';
import './App.css';

function App() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState('projects'); 
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [selectedProject, setSelectedProject] = useState(null);
  
  // ★ 1. 新增物理狀態：追蹤目前正在編輯的專案
  const [editProject, setEditProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const refreshGlobalData = useCallback(async (userId) => {
  if (!userId) return;
  setIsDataLoading(true);
  try {
    const [projRes, persRes] = await Promise.all([
      supabase
        .from('projects')
        .select(`
          *, 
          project_members(
            personnel_id, 
            personnel(*)
          )
        `) // ★ 關鍵：補上 personnel_id，這樣 pm.personnel_id 才有值
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
        
      supabase
        .from('personnel')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })
    ]);
    
    if (projRes.data) setProjects(projRes.data);
    if (persRes.data) setPersonnel(persRes.data);
  } catch (err) { 
    console.error("資料載入失敗", err); 
  } finally { 
    setIsDataLoading(false); 
  }
}, []);

  useEffect(() => { if (user?.id) refreshGlobalData(user.id); }, [user?.id, refreshGlobalData]);

  if (!user) return <AuthView />;

  return (
    <div className="app-main-layout">
      <div className={`sidebar-overlay ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} />

      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        user={user} 
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setSelectedProject(null);
          setIsMenuOpen(false);
        }} 
        onSignOut={() => setIsLogoutConfirmOpen(true)} 
      />

      <main className="content-area-wrapper">
        {currentView === 'projects' ? (
          !selectedProject ? (
            /* ★ 2. 關鍵修正：補上 Dashboard 缺失的 Props */
            <Dashboard 
              user={user} 
              projects={projects || []} 
              loading={isDataLoading} 
              onOpenMenu={() => setIsMenuOpen(true)} 
              onOpenCreate={() => setIsCreateModalOpen(true)} 
              onSelectProject={(p) => setSelectedProject(p)} 
              onRefresh={() => refreshGlobalData(user.id)}
              /* 這裡就是解決 TypeError 的連線 */
              onEditProject={(p) => setEditProject(p)} 
              onDeleteProject={(p) => { 
                /* 可以在這裡處理刪除邏輯或開啟 ConfirmModal */
                console.log("準備刪除專案", p);
              }}
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

      {/* 新增專案 */}
      <CreateProjectModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} user={user} personnel={personnel} onRefresh={() => refreshGlobalData(user.id)} />

      {/* ★ 3. 實作補完：編輯專案抽屜 */}
      <EditProjectModal 
        isOpen={!!editProject} 
        project={editProject} 
        user={user} 
        personnel={personnel} 
        onClose={() => setEditProject(null)} 
        onRefresh={() => refreshGlobalData(user.id)} 
      />

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

      <ConfirmModal 
        open={isLogoutConfirmOpen} 
        title="確認登出系統？"
        content="登出後需重新登入才能繼續管理您的分帳專案。"
        okText="確認登出"
        cancelText="取消"
        isDanger={true} 
        onConfirm={async () => { 
          await signOut(); 
          setIsLogoutConfirmOpen(false); 
        }} 
        onCancel={() => setIsLogoutConfirmOpen(false)} 
      />
    </div>
  );
}

export default App;