import React, { useState, useEffect, useCallback } from 'react';
// ...existing code...
import { useProjectsStore } from './store/useProjectsStore';
import { useModalStore } from './store/useModalStore';
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
import TutorialModal from './components/TutorialModal';
import './App.css';

const PROJECT_PAGE_SIZE = 10;

function App() {
  const { user, signOut } = useAuth(); // 只從 AuthContext 取得 user 狀態

  /* --- 狀態定義 --- */
  const [currentView, setCurrentView] = useState('projects'); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);        
  const [selectedProject, setSelectedProject] = useState(null);
  const [editProject, setEditProject] = useState(null);
  
  const [personnel, setPersonnel] = useState([]); 
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // 專案相關狀態與方法來自 store
  const {
    projects,
    loading: projectsLoading,
    hasMore: projectsHasMore,
    page: projectPage,
    fetchProjects,
  } = useProjectsStore();

  const [isTypesEmpty, setIsTypesEmpty] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null); // 仍需本地狀態
  const [targetJoinProject, setTargetJoinProject] = useState(null);   // 仍需本地狀態

  // Modal 狀態與 actions 來自全域 store
  const {
    isCreateModalOpen,
    isEditProjectModalOpen,
    isAddTransactionOpen,
    isJoinModalOpen,
    isLogoutConfirmModalOpen,
    isSetupModalOpen,
    openModal,
    closeModal,
  } = useModalStore();

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const showGlobalBadge = isTypesEmpty;

  /* --- 2. 檢查紅點狀態 --- */
  const checkCategoriesStatus = useCallback(async () => {
    if (!user?.id) return;
    const { count } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    setIsTypesEmpty(count === 0);
  }, [user?.id]);

  /* --- 3. URL 狀態管理：專案 ID 持久化 --- */
  const updateUrlProjectId = (projectId) => {
    const url = new URL(window.location);
    if (projectId) {
      url.searchParams.set('projectId', projectId);
    } else {
      url.searchParams.delete('projectId');
    }
    window.history.pushState({}, '', url);
  };

  const loadProjectFromUrl = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('projectId');
    
    if (projectId && !selectedProject && user?.id) {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*, project_members!inner(user_id)')
          .eq('id', projectId)
          .eq('project_members.user_id', user.id)
          .single();
          
        if (!error && data) {
          setSelectedProject(data);
        } else {
          // 專案不存在或無權限，清除 URL
          updateUrlProjectId(null);
        }
      } catch (err) {
        console.error('載入專案失敗:', err);
        updateUrlProjectId(null);
      }
    }
  }, [selectedProject, user?.id]);

  // projects 相關的 fetch/add/remove/update 已交由 useProjectsStore 處理

  /* --- UI 事件處理 --- */
  // 重新整理 (重置回第 0 頁)
  const handleRefresh = () => {
    if (user?.id) {
      console.log('App fetching projects for:', user.id);
      fetchProjects(user.id, true, null); // 不過濾狀態
    }
  };

  // 載入更多 (載入下一頁)
  const handleLoadMore = () => {
    if (!projectsHasMore || projectsLoading || !user?.id) return;
    console.log('App fetching projects for:', user.id);
    fetchProjects(user.id, false, null); // 不過濾狀態
  };

  /* --- Google 登入邏輯 --- */
  const handleGoogleLogin = async () => {
    setLoadingText('正在導向 Google...');
    setIsDataLoading(true);
    
    try {
      const options = {
        redirectTo: import.meta.env.VITE_REDIRECT_URL || window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        }
      };
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options
      });
      
      if (error) throw error;
    } catch (err) {
      setIsDataLoading(false);
      message.error('Google 登入啟動失敗: ' + err.message);
    }
  };
  /* --- 初始化 useEffect --- */
  // 只負責主題、紅點、邀請碼等初始化
  useEffect(() => {
    if (!user) {
      const root = document.documentElement.style;
      ['primary', 'bg', 'card', 'text-main', 'text-sub'].forEach(p => root.removeProperty(`--color-${p}`));
      return;
    }

    setIsMenuOpen(false);       
    setCurrentView('projects'); 
    setSelectedProject(null);   

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

      // 3. 邀請碼邏輯
      // 3. 邀請碼邏輯 (修正版：支援 LIFF 解碼)
      const params = new URLSearchParams(window.location.search);
      let codeFromUrl = params.get('code');

      // ✨ 新增：如果 URL 沒直接抓到 code，但有 liff.state，就進去拆箱解碼
      if (!codeFromUrl && params.has('liff.state')) {
        try {
          const liffState = params.get('liff.state'); // 拿到 "%3Fcode%3D4739fa"
          const decodedSearch = decodeURIComponent(liffState); // 解碼成 "?code=4739fa"
          const stateParams = new URLSearchParams(decodedSearch);
          codeFromUrl = stateParams.get('code');
          if (codeFromUrl) console.log('✅ 從 liff.state 成功提取邀請碼:', codeFromUrl);
        } catch (e) {
          console.error('解析 liff.state 出錯:', e);
        }
      }

      const codeFromStorage = localStorage.getItem('pending_invite_code');
      const codeToProcess = codeFromUrl || codeFromStorage;

      if (codeToProcess) {
        if (codeFromUrl) localStorage.setItem('pending_invite_code', codeFromUrl);
        
        try {
          const { data: projects, error } = await supabase.rpc('get_project_preview_by_code', { 
            p_invite_code: codeToProcess 
          });
          
          if (error || !projects || projects.length === 0) return;

          const project = projects[0];
          const { data: membership } = await supabase
            .from('project_members')
            .select('id')
            .eq('project_id', project.id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (membership) {
            handleRefresh();
            setSelectedProject(project);
            // ✨ 第一步：在這裡設定 projectId
            updateUrlProjectId(project.id); 
            message.success(`已自動切換至專案：${project.name}`);
          } else {
            setTargetJoinProject(project);
            setIsJoinModalOpen(true);
            // 註：未加入前先不改 URL，等 JoinProjectModal 成功後它會自己改
          }
        } catch (err) {
          console.error('處理邀請碼失敗:', err);
        } finally {
          // ✨ 第二步：精確清理 URL，只移除邀請相關參數
          localStorage.removeItem('pending_invite_code');
          
          const url = new URL(window.location);
          url.searchParams.delete('code');       // 移除 code
          url.searchParams.delete('liff.state'); // 移除 liff.state
          
          // 使用 replaceState 替換網址，這樣 projectId 就會被保留下來
          window.history.replaceState({}, '', url.pathname + url.search);
        }
      }
    };
    init();
  }, [user, checkCategoriesStatus]);

  // 只負責抓取專案列表
  useEffect(() => {
    if (user?.id) {
      // 觀察 store 內部 projects 狀態
      console.log('Current projects in store before fetch:', projects.length);
      console.log('App fetching projects for:', user.id);
      fetchProjects(user.id, true, null); // 不過濾狀態
    }
  }, [user?.id, fetchProjects]);

  // URL 專案 ID 監聽 (分頁切回時自動載入)
  useEffect(() => {
    loadProjectFromUrl();
  }, [loadProjectFromUrl]);

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
      <TutorialModal />
      <div className={`sidebar-overlay ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} />
      
      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        user={user} 
        currentView={currentView}
        showBadge={showGlobalBadge} 
        onNavigate={(view) => { 
          setCurrentView(view); 
          if (view !== 'settings') {
            setSelectedProject(null);
            updateUrlProjectId(null); // 切換到其他頁面時清除專案記錄
          }
          setIsMenuOpen(false); 
        }} 
        onSignOut={() => openModal('logoutConfirm')} 
      />

      <main className="content-area-wrapper">
        {currentView === 'projects' ? (
          !selectedProject ? (
            <Dashboard 
              user={user} 
              projects={projects} // 來自 useProjectsStore
              loading={projectsLoading}
              onOpenMenu={() => setIsMenuOpen(true)} 
              onOpenCreate={() => openModal('create')}
              onSelectProject={(p) => {
                setSelectedProject(p);
                updateUrlProjectId(p.id); // 加入 URL 記錄
              }} 
              onEditProject={(p) => setEditProject(p)}
              showBadge={showGlobalBadge}
              onRefresh={handleRefresh}
              onLoadMore={handleLoadMore}
              hasMore={projectsHasMore}
              isFetchingMore={projectsLoading}
            />
          ) : (
            <ProjectDetailView 
              project={selectedProject} 
              onBack={() => { 
                setSelectedProject(null);
                updateUrlProjectId(null); // 清除 URL 記錄
                checkCategoriesStatus(); 
              }} 
              personnel={personnel} 
              onRefresh={handleRefresh}
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
      <CreateProjectModal isOpen={isCreateModalOpen} onClose={() => closeModal('create')} user={user} onRefresh={handleRefresh} />

      <EditProjectModal isOpen={!!editProject} project={editProject} user={user} personnel={personnel} onClose={() => setEditProject(null)} onRefresh={handleRefresh} />

      {selectedProject && (
        <AddTransactionModal 
          isOpen={isAddTransactionOpen} 
          onClose={() => closeModal('addTransaction')} 
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

      <JoinProjectModal isOpen={isJoinModalOpen} onClose={() => closeModal('join')} project={targetJoinProject} user={user} onSuccess={(p) => { 
        handleRefresh(); 
        setSelectedProject(p);
        updateUrlProjectId(p.id); // 加入專案成功時記錄 URL
      }} />

      <ConfirmModal open={isLogoutConfirmModalOpen} title="確認登出系統？" content="登出後需重新登入才能繼續管理。" onConfirm={async () => { await signOut(); closeModal('logoutConfirm'); }} onCancel={() => closeModal('logoutConfirm')} />

      {/* ★ 這裡呼叫 SetupProfileModal
        (請確保你的 SetupProfileModal.jsx 是我上一則回應提供的那個版本，
         它才會正確區分 Google 登入不用填密碼) 
      */}
      <SetupProfileModal isOpen={isSetupModalOpen} user={user} onComplete={() => closeModal('setup')} />
    </div>
  );
}

export default App;