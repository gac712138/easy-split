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
import SetupProfileModal from './components/SetupProfileModal'; 

// 動畫組件
import LoadingScreen from './components/LoadingScreen';
import './App.css';

const PROJECT_PAGE_SIZE = 10; // ★ 專案每頁顯示數量

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
  
  // ★ 專案分頁狀態
  const [projectPage, setProjectPage] = useState(0);
  const [projectsHasMore, setProjectsHasMore] = useState(true);
  const [isProjectFetchingMore, setIsProjectFetchingMore] = useState(false);

  // Modals
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null); 
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [targetJoinProject, setTargetJoinProject] = useState(null); 
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /* --- 資料抓取 (支援分頁) --- */
  const refreshGlobalData = useCallback(async (userId, reset = false) => {
    if (!userId) return;
    
    // 如果是 reset (例如重新整理或剛登入)，顯示全螢幕 Loading
    // 如果是 load more，則不顯示全螢幕 Loading
    if (reset) setIsDataLoading(true);

    try {
      const currentPage = reset ? 0 : projectPage + 1; // 如果是 reset 就從 0 開始，否則下一頁
      if (!reset) setIsProjectFetchingMore(true);

      const from = currentPage * PROJECT_PAGE_SIZE;
      const to = from + PROJECT_PAGE_SIZE - 1;

      // 1. 抓取專案 (分頁)
      const projPromise = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      // 2. 抓取人員 (不分頁，因為要用來對應名字，資料量通常較小)
      const persPromise = supabase.from('personnel').select('*');

      const [projRes, persRes] = await Promise.all([projPromise, persPromise]);

      if (projRes.data) {
        const newProjects = projRes.data;
        
        // 判斷是否還有更多
        if (newProjects.length < PROJECT_PAGE_SIZE) {
          setProjectsHasMore(false);
        } else {
          setProjectsHasMore(true);
        }

        if (reset) {
          setProjects(newProjects);
          setProjectPage(0);
        } else {
          setProjects(prev => [...prev, ...newProjects]);
          setProjectPage(currentPage);
        }

        // 同步更新 selectedProject (如果是編輯後的刷新)
        setSelectedProject(current => {
          if (!current) return null;
          const freshProject = projRes.data.find(p => p.id === current.id);
          return freshProject || current;
        });
      }

      if (persRes.data) setPersonnel(persRes.data);
      
      setRefreshTrigger(prev => prev + 1);

    } catch (err) {
      console.error(err);
      message.error("資料同步失敗");
    } finally {
      setIsDataLoading(false);
      setIsProjectFetchingMore(false);
    }
  }, [projectPage]); // 依賴 page

  // ★ 專門給「載入更多」用的函式
  const loadMoreProjects = () => {
    if (!projectsHasMore || isProjectFetchingMore) return;
    refreshGlobalData(user?.id, false); // false = append
  };

  /* --- 初始化 --- */
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
      
      // ★ 初始載入 (Reset = true)
      await refreshGlobalData(user.id, true);

      // 處理邀請碼
      const params = new URLSearchParams(window.location.search);
      const codeFromUrl = params.get('code');
      const codeFromStorage = localStorage.getItem('pending_invite_code');
      const codeToProcess = codeFromUrl || codeFromStorage;

      if (codeToProcess) {
        if (codeFromUrl) localStorage.setItem('pending_invite_code', codeFromUrl);
        // ... processInviteCode 邏輯 (省略以節省篇幅，請保留原本的 function)
        // 為了完整性，這裡假設 processInviteCode 存在於外部或此處
      }
    };
    init();
  }, [user]); // 移除 refreshGlobalData 依賴，避免循環

  // ... (省略 processInviteCode 實作，請保留原本的) ...
  // 注意：這裡因為篇幅關係省略 processInviteCode，實際上你需要保留它

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
              user={user} 
              projects={projects} 
              loading={isDataLoading} // 這是初次 loading
              onOpenMenu={() => setIsMenuOpen(true)} 
              onOpenCreate={() => setIsCreateModalOpen(true)}
              onSelectProject={(p) => setSelectedProject(p)} 
              onEditProject={(p) => setEditProject(p)}
              onRefresh={() => refreshGlobalData(user.id, true)}
              // ★ 傳遞分頁 props
              onLoadMore={loadMoreProjects}
              hasMore={projectsHasMore}
              isFetchingMore={isProjectFetchingMore}
            />
          ) : (
            <ProjectDetailView 
              project={selectedProject} onBack={() => setSelectedProject(null)} personnel={personnel} 
              onRefresh={() => refreshGlobalData(user.id, true)} // 詳情頁刷新通常希望重抓最新的
              onAddTransaction={() => { setEditingTransaction(null); setIsAddTransactionOpen(true); }}
              onEditTransaction={(transaction) => { setEditingTransaction(transaction); setIsAddTransactionOpen(true); }}
              lastUpdated={refreshTrigger}
            />
          )
        ) : (
          <SettingsView onOpenMenu={() => setIsMenuOpen(true)} user={user} />
        )}
      </main>

      <CreateProjectModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} user={user} onRefresh={() => refreshGlobalData(user.id, true)} />
      <EditProjectModal isOpen={!!editProject} project={editProject} user={user} personnel={personnel} onClose={() => setEditProject(null)} onRefresh={() => refreshGlobalData(user.id, true)} />
      {selectedProject && (
        <AddTransactionModal isOpen={isAddTransactionOpen} onClose={() => setIsAddTransactionOpen(false)} project={selectedProject} personnel={personnel} user={user} transaction={editingTransaction} onRefresh={() => { refreshGlobalData(user.id, true); setRefreshTrigger(prev => prev + 1); }} />
      )}
      <JoinProjectModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} project={targetJoinProject} user={user} onSuccess={(project) => { refreshGlobalData(user.id, true); setSelectedProject(project); }} />
      <ConfirmModal open={isLogoutConfirmOpen} title="確認登出系統？" content="登出後需重新登入才能繼續管理。" onConfirm={async () => { await signOut(); setIsLogoutConfirmOpen(false); }} onCancel={() => setIsLogoutConfirmOpen(false)} />

      <SetupProfileModal isOpen={isSetupModalOpen} user={user} onComplete={() => setIsSetupModalOpen(false)} />
    </div>
  );
}

export default App;