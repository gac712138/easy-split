import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabaseClient';
import { message } from 'antd';
// 視圖與組件 import 維持不變...
import AuthView from './views/AuthView';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SettingsView from './views/SettingsView'; 
import ProjectDetailView from './views/ProjectDetailView';
import CreateProjectModal from './components/CreateProjectModal';
import EditProjectModal from './components/EditProjectModal';
import AddTransactionModal from './components/AddTransactionModal'; 
import ConfirmModal from './components/ConfirmModal';
import JoinProjectModal from './components/JoinProjectModal'; 
import SetupProfileModal from './components/SetupProfileModal'; 
import LoadingScreen from './components/LoadingScreen';
import './App.css';

const PROJECT_PAGE_SIZE = 10;

function App() {
  const { user, signOut } = useAuth();

  /* --- 狀態定義 --- */
  const [currentView, setCurrentView] = useState('projects'); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);        
  const [selectedProject, setSelectedProject] = useState(null);
  const [editProject, setEditProject] = useState(null);
  
  const [projects, setProjects] = useState([]);
  const [personnel, setPersonnel] = useState([]); 
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(''); // 修正預設值為空
  
  const [projectPage, setProjectPage] = useState(0);
  const [projectsHasMore, setProjectsHasMore] = useState(true);
  const [isProjectFetchingMore, setIsProjectFetchingMore] = useState(false);

  const [isTypesEmpty, setIsTypesEmpty] = useState(false);

  /* --- Modal 狀態 --- */
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null); 
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [targetJoinProject, setTargetJoinProject] = useState(null); 
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const showGlobalBadge = isTypesEmpty;

  /* --- 1. 純淨的 API 抓取函式 (不依賴 State) --- */
  const fetchProjectsApi = useCallback(async (userId, pageIndex) => {
    const from = pageIndex * PROJECT_PAGE_SIZE;
    const to = from + PROJECT_PAGE_SIZE - 1;
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);
      
    if (error) throw error;
    return data;
  }, []);

  /* --- 2. 檢查紅點狀態 --- */
  const checkCategoriesStatus = useCallback(async () => {
    if (!user?.id) return;
    const { count } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    setIsTypesEmpty(count === 0);
  }, [user?.id]);

  /* --- 3. 整合後的資料更新邏輯 (取代原本的 refreshGlobalData) --- */
  // 這個函式負責更新 State，它依賴 fetchProjectsApi，但不依賴 projectPage
  const fetchAndSetProjects = useCallback(async (userId, page, isReset) => {
    if (!userId) return;

    try {
      if (isReset) {
        setIsDataLoading(true);
      } else {
        setIsProjectFetchingMore(true);
      }

      // ★ 呼叫上面定義好的 API 函式
      const data = await fetchProjectsApi(userId, page);

      if (data) {
        setProjects(prev => isReset ? data : [...prev, ...data]);
        setProjectsHasMore(data.length === PROJECT_PAGE_SIZE);
        setProjectPage(page); // 在這裡才更新頁碼 State
      }
    } catch (err) {
      console.error(err);
      message.error("專案同步失敗");
    } finally {
      setIsDataLoading(false); 
      setIsProjectFetchingMore(false);
    }
  }, [fetchProjectsApi]);

  /* --- UI 事件處理 --- */
  // 重新整理 (重置回第 0 頁)
  const handleRefresh = () => {
    if (user?.id) fetchAndSetProjects(user.id, 0, true);
  };

  // 載入更多 (載入下一頁)
  const handleLoadMore = () => {
    if (!projectsHasMore || isProjectFetchingMore || !user?.id) return;
    const nextPage = projectPage + 1;
    fetchAndSetProjects(user.id, nextPage, false);
  };

  /* --- Google 登入邏輯 --- */
  const handleGoogleLogin = async () => {
    setLoadingText('正在導向 Google...');
    setIsDataLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin, 
          queryParams: { access_type: 'offline', prompt: 'select_account' },
        },
      });
      if (error) throw error;
    } catch (err) {
      setIsDataLoading(false);
      message.error('Google 登入啟動失敗: ' + err.message);
    }
  };

  /* --- 初始化 useEffect --- */
  useEffect(() => {
    if (!user) {
      const root = document.documentElement.style;
      ['primary', 'bg', 'card', 'text-main', 'text-sub'].forEach(p => root.removeProperty(`--color-${p}`));
      return;
    }

    // 重置狀態
    setIsMenuOpen(false);       
    setCurrentView('projects'); 
    setSelectedProject(null);   

    // ★ 關鍵：檢查是否需要彈出設定視窗 (初次登入/無暱稱者)
    // 邏輯：如果有 user，但 user_metadata 內沒有 name，就開啟設定
    if (!user.user_metadata || !user.user_metadata.name) {
      setIsSetupModalOpen(true);
    }

    const init = async () => {
      // 1. 讀取佈景主題
      const { data: themeData } = await supabase.from('user_settings').select('key, value').eq('user_id', user.id);
      if (themeData) {
        themeData.forEach(s => {
          document.documentElement.style.setProperty(`--color-${s.key.replace('theme_', '')}`, s.value);
        });
      }

      // 2. 初始化檢查紅點
      await checkCategoriesStatus();

      // ★ 3. 呼叫新的資料函式 (初始化：第 0 頁，Reset = true)
      await fetchAndSetProjects(user.id, 0, true);

      // 4. 邀請碼邏輯
      const params = new URLSearchParams(window.location.search);
      const codeFromUrl = params.get('code');
      const codeFromStorage = localStorage.getItem('pending_invite_code');
      const codeToProcess = codeFromUrl || codeFromStorage;

      if (codeToProcess) {
        if (codeFromUrl) localStorage.setItem('pending_invite_code', codeFromUrl);
        try {
          const { data: projects, error } = await supabase.rpc('get_project_preview_by_code', { p_invite_code: codeToProcess });
          if (error || !projects || projects.length === 0) return;

          const project = projects[0];
          const { data: membership } = await supabase.from('project_members').select('id').eq('project_id', project.id).eq('user_id', user.id).maybeSingle();

          if (membership) {
            setSelectedProject(project);
          } else {
            setTargetJoinProject(project);
            setIsJoinModalOpen(true);
          }
        } catch (err) {
          console.error(err);
        } finally {
          localStorage.removeItem('pending_invite_code');
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    };
    init();
    
    // ★ 關鍵：依賴列表移除 projectPage，加入 fetchAndSetProjects
  }, [user, fetchAndSetProjects, checkCategoriesStatus]);

  if (!user) {
    return (
      <>
        {isDataLoading && <LoadingScreen text={loadingText} />}
        <AuthView onGoogleLogin={handleGoogleLogin} />
      </>
    );
  }

  return (
    <div className="app-main-layout">
      {/* 修正：使用動態 loadingText，若無則顯示 EasySplit */}
      {isDataLoading && <LoadingScreen text={loadingText || "EasySplit"} />}

      <div className={`sidebar-overlay ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} />
      
      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        user={user} 
        currentView={currentView}
        showBadge={showGlobalBadge} 
        onNavigate={(view) => { 
          setCurrentView(view); 
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
              showBadge={showGlobalBadge}
              
              /* ★ 修正：這裡改用新的 handler */
              onRefresh={handleRefresh}
              onLoadMore={handleLoadMore}
              
              hasMore={projectsHasMore}
              isFetchingMore={isProjectFetchingMore}
            />
          ) : (
            <ProjectDetailView 
              project={selectedProject} 
              onBack={() => { 
                setSelectedProject(null); 
                checkCategoriesStatus(); 
              }} 
              personnel={personnel} 
              onRefresh={handleRefresh} // 這裡也統一用 handleRefresh
              onAddTransaction={() => { setEditingTransaction(null); setIsAddTransactionOpen(true); }}
              onEditTransaction={(transaction) => { setEditingTransaction(transaction); setIsAddTransactionOpen(true); }}
              lastUpdated={refreshTrigger}
              setIsTypesEmpty={setIsTypesEmpty} 
            />
          )
        ) : (
          <SettingsView 
            onOpenMenu={() => setIsMenuOpen(true)} 
            user={user} 
            showBadge={showGlobalBadge} 
            onRefresh={checkCategoriesStatus} 
          />
        )}
      </main>

      {/* --- Modals --- */}
      <CreateProjectModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} user={user} onRefresh={handleRefresh} />
      
      <EditProjectModal isOpen={!!editProject} project={editProject} user={user} personnel={personnel} onClose={() => setEditProject(null)} onRefresh={handleRefresh} />
      
      {selectedProject && (
        <AddTransactionModal 
          isOpen={isAddTransactionOpen} 
          onClose={() => setIsAddTransactionOpen(false)} 
          project={selectedProject} 
          personnel={personnel} 
          user={user} 
          transaction={editingTransaction} 
          onRefresh={() => { 
            handleRefresh();
            setRefreshTrigger(prev => prev + 1); 
          }} 
        />
      )}
      
      <JoinProjectModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} project={targetJoinProject} user={user} onSuccess={(p) => { handleRefresh(); setSelectedProject(p); }} />
      
      <ConfirmModal open={isLogoutConfirmOpen} title="確認登出系統？" content="登出後需重新登入才能繼續管理。" onConfirm={async () => { await signOut(); setIsLogoutConfirmOpen(false); }} onCancel={() => setIsLogoutConfirmOpen(false)} />
      
      {/* ★ 這裡呼叫 SetupProfileModal
        (請確保你的 SetupProfileModal.jsx 是我上一則回應提供的那個版本，
         它才會正確區分 Google 登入不用填密碼) 
      */}
      <SetupProfileModal isOpen={isSetupModalOpen} user={user} onComplete={() => setIsSetupModalOpen(false)} />
    </div>
  );
}

export default App;