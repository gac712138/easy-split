import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabaseClient';
import { message } from 'antd';
import { Menu } from 'lucide-react'; // 確保引入 Menu

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

const PROJECT_PAGE_SIZE = 10;

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
  
  // 專案分頁狀態
  const [projectPage, setProjectPage] = useState(0);
  const [projectsHasMore, setProjectsHasMore] = useState(true);
  const [isProjectFetchingMore, setIsProjectFetchingMore] = useState(false);

  // ★ 新增：款項類型是否為空的狀態提示
  const [isTypesEmpty, setIsTypesEmpty] = useState(false);

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
    if (reset) setIsDataLoading(true);

    try {
      const currentPage = reset ? 0 : projectPage + 1;
      if (!reset) setIsProjectFetchingMore(true);

      const from = currentPage * PROJECT_PAGE_SIZE;
      const to = from + PROJECT_PAGE_SIZE - 1;

      const projPromise = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      const persPromise = supabase.from('personnel').select('*');
      const [projRes, persRes] = await Promise.all([projPromise, persPromise]);

      if (projRes.data) {
        const newProjects = projRes.data;
        setProjectsHasMore(newProjects.length === PROJECT_PAGE_SIZE);

        if (reset) {
          setProjects(newProjects);
          setProjectPage(0);
        } else {
          setProjects(prev => [...prev, ...newProjects]);
          setProjectPage(currentPage);
        }

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
  }, [projectPage]);

  const loadMoreProjects = () => {
    if (!projectsHasMore || isProjectFetchingMore) return;
    refreshGlobalData(user?.id, false);
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
      await refreshGlobalData(user.id, true);

      const params = new URLSearchParams(window.location.search);
      const codeFromUrl = params.get('code');
      const codeFromStorage = localStorage.getItem('pending_invite_code');
      const codeToProcess = codeFromUrl || codeFromStorage;

      if (codeToProcess) {
        if (codeFromUrl) localStorage.setItem('pending_invite_code', codeFromUrl);
        // ... processInviteCode 邏輯
      }
    };
    init();
  }, [user]);

  if (!user) return <AuthView />;

  // ★ 判定是否需要顯示提醒紅點 (必須是專案擁有者且類型為空)
  const isOwner = selectedProject && user?.id === selectedProject.user_id;
  const showRedDot = isTypesEmpty && isOwner;

  return (
    <div className="app-main-layout">
      {isDataLoading && <LoadingScreen text="EasySplit" />}

      <div className={`sidebar-overlay ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} />
      
      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        user={user} 
        currentView={currentView}
        showBadge={showRedDot} // ★ 傳入紅點顯示邏輯
        onNavigate={(view) => { 
          setCurrentView(view); 
          // 只有在切換到非設定頁時才清空專案
          if (view !== 'settings') setSelectedProject(null); 
          setIsMenuOpen(false); 
        }} 
        onSignOut={() => setIsLogoutConfirmOpen(true)} 
      />

      <main className="content-area-wrapper">
        {currentView === 'projects' ? (
          !selectedProject ? (
            <Dashboard 
              user={user} 
              projects={projects} 
              loading={isDataLoading}
              onOpenMenu={() => setIsMenuOpen(true)} 
              onOpenCreate={() => setIsCreateModalOpen(true)}
              onSelectProject={(p) => setSelectedProject(p)} 
              onEditProject={(p) => setEditProject(p)}
              onRefresh={() => refreshGlobalData(user.id, true)}
              onLoadMore={loadMoreProjects}
              hasMore={projectsHasMore}
              isFetchingMore={isProjectFetchingMore}
            />
          ) : (
            <ProjectDetailView 
              project={selectedProject} 
              onBack={() => { 
                setSelectedProject(null); 
                setIsTypesEmpty(false); // ★ 返回列表時重置狀態
              }} 
              personnel={personnel} 
              onRefresh={() => refreshGlobalData(user.id, true)} 
              onAddTransaction={() => { setEditingTransaction(null); setIsAddTransactionOpen(true); }}
              onEditTransaction={(transaction) => { setEditingTransaction(transaction); setIsAddTransactionOpen(true); }}
              lastUpdated={refreshTrigger}
              setIsTypesEmpty={setIsTypesEmpty} // ★ 傳入 Setter 供 DetailView 偵測
            />
          )
        ) : (
          <SettingsView 
            onOpenMenu={() => setIsMenuOpen(true)} 
            user={user} 
            showBadge={showRedDot} // ★ 設定頁同步顯示紅點
          />
        )}
      </main>

      {/* Navbar 的漢堡按鈕也加上紅點提示 */}
      {!selectedProject && currentView === 'projects' && (
        <header className="navbar-fixed-mobile" style={{ position: 'absolute', top: 0, left: 0, padding: '12px' }}>
             {/* 此處邏輯通常在 Dashboard 內部，但若 App 有 Header 則在此處理 */}
        </header>
      )}

      <CreateProjectModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} user={user} onRefresh={() => refreshGlobalData(user.id, true)} />
      <EditProjectModal isOpen={!!editProject} project={editProject} user={user} personnel={personnel} onClose={() => setEditProject(null)} onRefresh={() => refreshGlobalData(user.id, true)} />
      
      {selectedProject && (
        <AddTransactionModal 
          isOpen={isAddTransactionOpen} 
          onClose={() => setIsAddTransactionOpen(false)} 
          project={selectedProject} 
          personnel={personnel} 
          user={user} 
          transaction={editingTransaction} 
          onRefresh={() => { refreshGlobalData(user.id, true); setRefreshTrigger(prev => prev + 1); }} 
        />
      )}
      
      <JoinProjectModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} project={targetJoinProject} user={user} onSuccess={(project) => { refreshGlobalData(user.id, true); setSelectedProject(project); }} />
      <ConfirmModal open={isLogoutConfirmOpen} title="確認登出系統？" content="登出後需重新登入才能繼續管理。" onConfirm={async () => { await signOut(); setIsLogoutConfirmOpen(false); }} onCancel={() => setIsLogoutConfirmOpen(false)} />
      <SetupProfileModal isOpen={isSetupModalOpen} user={user} onComplete={() => setIsSetupModalOpen(false)} />
    </div>
  );
}

export default App;