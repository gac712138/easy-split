import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabaseClient';
import { message } from 'antd';

// 視圖組件
import AuthView from './views/AuthView';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SettingsView from './views/SettingsView'; 
import ProjectDetailView from './views/ProjectDetailView';

// 彈窗組件
import CreateProjectModal from './components/CreateProjectModal';
import EditProjectModal from './components/EditProjectModal';
import AddTransactionModal from './components/AddTransactionModal'; 
import ConfirmModal from './components/ConfirmModal';
import JoinProjectModal from './components/JoinProjectModal'; 
import SetupProfileModal from './components/SetupProfileModal'; // ★ 新增

// 動畫組件
import LoadingScreen from './components/LoadingScreen';
import './App.css';

function App() {
  const { user, signOut } = useAuth();

  /* --- 狀態 --- */
  const [currentView, setCurrentView] = useState('projects'); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);        
  const [selectedProject, setSelectedProject] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [personnel, setPersonnel] = useState([]); 
  const [isDataLoading, setIsDataLoading] = useState(false);
  
  // Modals
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null); 
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [targetJoinProject, setTargetJoinProject] = useState(null); 
  
  // ★ 新增：設定資料彈窗
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshGlobalData = useCallback(async (userId) => {
    if (!userId) return;
    setIsDataLoading(true);
    try {
      const [projRes, persRes] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('personnel').select('*')
      ]);
      if (projRes.data) setProjects(projRes.data);
      if (persRes.data) setPersonnel(persRes.data);
    } catch (err) { console.error(err); } 
    finally { setIsDataLoading(false); }
  }, []);

  const processInviteCode = async (code) => {
    const { data: project, error } = await supabase.rpc('get_project_by_invite_code', { code_input: code }).single();
    if (error || !project) {
        localStorage.removeItem('pending_invite_code'); 
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }
    const { data: member } = await supabase.from('project_members').select('id').eq('project_id', project.id).eq('user_id', user.id).maybeSingle();
    localStorage.removeItem('pending_invite_code');
    window.history.replaceState({}, document.title, window.location.pathname);
    if (member) { setSelectedProject(project); return; }
    setTargetJoinProject(project); setIsJoinModalOpen(true);
  };

  useEffect(() => {
    if (!user) {
      const root = document.documentElement.style;
      ['primary', 'bg', 'card', 'text-main', 'text-sub'].forEach(p => root.removeProperty(`--color-${p}`));
      return;
    }

    // 重置 UI
    setIsMenuOpen(false);       
    setCurrentView('projects'); 
    setSelectedProject(null);   

    // ★ 檢查是否為新用戶 (有登入但沒名字)
    if (!user.user_metadata?.name) {
      setIsSetupModalOpen(true);
    }

    const init = async () => {
      const { data } = await supabase.from('user_settings').select('key, value').eq('user_id', user.id);
      if (data) {
        data.forEach(s => {
          document.documentElement.style.setProperty(`--color-${s.key.replace('theme_', '')}`, s.value);
        });
      }
      await refreshGlobalData(user.id);

      const params = new URLSearchParams(window.location.search);
      const codeFromUrl = params.get('code');
      const codeFromStorage = localStorage.getItem('pending_invite_code');
      const codeToProcess = codeFromUrl || codeFromStorage;

      if (codeToProcess) {
        if (codeFromUrl) localStorage.setItem('pending_invite_code', codeFromUrl);
        await processInviteCode(codeToProcess);
      }
    };
    init();
  }, [user, refreshGlobalData]); 

  if (!user) return <AuthView />;

  return (
    <div className="app-main-layout">
      {isDataLoading && <LoadingScreen text="EasySplit" />}

      <div className={`sidebar-overlay ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} />
      <Sidebar 
        isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} user={user} currentView={currentView}
        onNavigate={(view) => { setCurrentView(view); setSelectedProject(null); setIsMenuOpen(false); }} 
        onSignOut={() => setIsLogoutConfirmOpen(true)} 
      />

      <main className="content-area-wrapper">
        {currentView === 'projects' ? (
          !selectedProject ? (
            <Dashboard 
              user={user} projects={projects} loading={isDataLoading}
              onOpenMenu={() => setIsMenuOpen(true)} onOpenCreate={() => setIsCreateModalOpen(true)}
              onSelectProject={(p) => setSelectedProject(p)} onEditProject={(p) => setEditProject(p)}
              onRefresh={() => refreshGlobalData(user.id)}
            />
          ) : (
            <ProjectDetailView 
              project={selectedProject} onBack={() => setSelectedProject(null)} personnel={personnel} 
              onRefresh={() => refreshGlobalData(user.id)}
              onAddTransaction={() => { setEditingTransaction(null); setIsAddTransactionOpen(true); }}
              onEditTransaction={(transaction) => { setEditingTransaction(transaction); setIsAddTransactionOpen(true); }}
              lastUpdated={refreshTrigger}
            />
          )
        ) : (
          <SettingsView onOpenMenu={() => setIsMenuOpen(true)} user={user} />
        )}
      </main>

      <CreateProjectModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} user={user} onRefresh={() => refreshGlobalData(user.id)} />
      <EditProjectModal isOpen={!!editProject} project={editProject} user={user} personnel={personnel} onClose={() => setEditProject(null)} onRefresh={() => refreshGlobalData(user.id)} />
      {selectedProject && (
        <AddTransactionModal isOpen={isAddTransactionOpen} onClose={() => setIsAddTransactionOpen(false)} project={selectedProject} personnel={personnel} user={user} transaction={editingTransaction} onRefresh={() => { refreshGlobalData(user.id); setRefreshTrigger(prev => prev + 1); }} />
      )}
      <JoinProjectModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} project={targetJoinProject} user={user} onSuccess={(project) => { refreshGlobalData(user.id); setSelectedProject(project); }} />
      <ConfirmModal open={isLogoutConfirmOpen} title="確認登出系統？" content="登出後需重新登入才能繼續管理。" onConfirm={async () => { await signOut(); setIsLogoutConfirmOpen(false); }} onCancel={() => setIsLogoutConfirmOpen(false)} />

      {/* ★ 這裡插入設定資料彈窗 */}
      <SetupProfileModal isOpen={isSetupModalOpen} user={user} onComplete={() => setIsSetupModalOpen(false)} />
    </div>
  );
}

export default App;