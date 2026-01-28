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
import SecuritySettingsView from './views/SecuritySettingsView'; 

// 彈窗組件
import CreateProjectModal from './components/CreateProjectModal';
import EditProjectModal from './components/EditProjectModal';
import AddTransactionModal from './components/AddTransactionModal'; 
import ConfirmModal from './components/ConfirmModal';
import JoinProjectModal from './components/JoinProjectModal'; 
import SetupProfileModal from './components/SetupProfileModal'; 

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
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // 用於強制觸發某些子元件更新的訊號
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /* --- 3. 核心資料抓取 (★ 關鍵修正處) --- */
  const refreshGlobalData = useCallback(async (userId) => {
    if (!userId) return;
    setIsDataLoading(true);
    try {
      const [projRes, persRes] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('personnel').select('*')
      ]);

      if (projRes.data) {
        setProjects(projRes.data);

        // ★★★ 關鍵修復：同步更新 selectedProject ★★★
        // 如果當前使用者正停留在某個專案頁面，我們必須用「最新的資料」去更新它
        // 否則 ProjectDetailView 裡的 project.status 永遠是舊的，畫面就不會變
        setSelectedProject(current => {
          if (!current) return null;
          // 在新抓回來的列表中，找到同一個 ID 的專案
          const freshProject = projRes.data.find(p => p.id === current.id);
          // 如果找到了，就用新的取代舊的；沒找到(可能被刪了)就維持原樣或設為 null
          return freshProject || current;
        });
      }

      if (persRes.data) setPersonnel(persRes.data);
      
      // 觸發子元件(如 ProjectDetailView) 內部 useEffect 的依賴更新
      setRefreshTrigger(prev => prev + 1);

    } catch (err) {
      console.error(err);
      message.error("資料同步失敗");
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  /* --- 4. 邀請連結攔截 --- */
  const processInviteCode = async (code) => {
    const { data: project, error } = await supabase.rpc('get_project_by_invite_code', { code_input: code }).single();
    if (error || !project) {
        console.error('Invite check failed:', error);
        message.error('邀請連結無效或專案不存在');
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

  /* --- 5. 初始化 --- */
  useEffect(() => {
    if (!user) {
      const root = document.documentElement.style;
      ['primary', 'bg', 'card', 'text-main', 'text-sub'].forEach(p => root.removeProperty(`--color-${p}`));
      return;
    }

    setIsMenuOpen(false);       
    setCurrentView('projects'); 
    setSelectedProject(null);   

    if (user && !user.user_metadata?.name) {
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

      <SetupProfileModal isOpen={isSetupModalOpen} user={user} onComplete={() => setIsSetupModalOpen(false)} />
    </div>
  );
}

export default App;