import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabaseClient';
import { message } from 'antd';
import { Menu } from 'lucide-react'; 

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

  /* --- 狀態：基礎導覽 --- */
  const [currentView, setCurrentView] = useState('projects'); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);        
  const [selectedProject, setSelectedProject] = useState(null);
  const [editProject, setEditProject] = useState(null);
  
  /* --- 狀態：資料清單 --- */
  const [projects, setProjects] = useState([]);
  const [personnel, setPersonnel] = useState([]); 
  const [isDataLoading, setIsDataLoading] = useState(false);
  
  /* --- 狀態：分頁邏輯 --- */
  const [projectPage, setProjectPage] = useState(0);
  const [projectsHasMore, setProjectsHasMore] = useState(true);
  const [isProjectFetchingMore, setIsProjectFetchingMore] = useState(false);

  /* --- ★ 新增狀態：紅點即時偵測 --- */
  const [isTypesEmpty, setIsTypesEmpty] = useState(false);

  /* --- 狀態：彈窗控制 (Modals) --- */
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null); 
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [targetJoinProject, setTargetJoinProject] = useState(null); 
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  /* --- 狀態：更新觸發器 --- */
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 定義全域紅點顯示邏輯
  const showGlobalBadge = isTypesEmpty;

  /* --- ★ 關鍵優化：建立專門檢查分類狀態的函式 (供跨組件即時呼叫) --- */
  const checkCategoriesStatus = useCallback(async () => {
    if (!user?.id) return;
    const { count } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    setIsTypesEmpty(count === 0);
  }, [user?.id]);

  /* --- 資料抓取邏輯 (支援分頁) --- */
  const refreshGlobalData = useCallback(async (userId, reset = false) => {
    if (!userId) return;
    if (reset) setIsDataLoading(true);

    try {
      const currentPage = reset ? 0 : projectPage + 1;
      const from = currentPage * PROJECT_PAGE_SIZE;
      const to = from + PROJECT_PAGE_SIZE - 1;

      // 抓取專案清單
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data) {
        setProjects(reset ? data : prev => [...prev, ...data]);
        setProjectsHasMore(data.length === PROJECT_PAGE_SIZE);
        if (reset) setProjectPage(0); else setProjectPage(currentPage);
      }
    } catch (err) {
      message.error("專案同步失敗");
    } finally {
      setIsDataLoading(false); 
    }
  }, [projectPage]);

  const loadMoreProjects = () => {
    if (!projectsHasMore || isProjectFetchingMore) return;
    refreshGlobalData(user?.id, false);
  };

  /* --- 初始化與邀請碼邏輯 (不省略任何內容) --- */
  useEffect(() => {
    if (!user) {
      const root = document.documentElement.style;
      ['primary', 'bg', 'card', 'text-main', 'text-sub'].forEach(p => root.removeProperty(`--color-${p}`));
      return;
    }

    // 重置初始狀態
    setIsMenuOpen(false);       
    setCurrentView('projects'); 
    setSelectedProject(null);   

    // 檢查 Profile 設定
    if (user && !user.user_metadata?.name) {
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

      // ★ 2. 新增：初始化時檢查紅點狀態
      await checkCategoriesStatus();

      // 3. 同步專案資料
      await refreshGlobalData(user.id, true);

      // 4. 邀請碼邏輯 (完整復刻)
      const params = new URLSearchParams(window.location.search);
      const codeFromUrl = params.get('code');
      const codeFromStorage = localStorage.getItem('pending_invite_code');
      const codeToProcess = codeFromUrl || codeFromStorage;

      if (codeToProcess) {
        if (codeFromUrl) localStorage.setItem('pending_invite_code', codeFromUrl);

        try {
          // A. 透過 RPC 取得專案預覽
          const { data: projects, error } = await supabase.rpc('get_project_preview_by_code', {
            p_invite_code: codeToProcess
          });

          if (error || !projects || projects.length === 0) {
            console.error('邀請碼無效');
            return;
          }

          const project = projects[0];

          // B. 檢查目前登入的使用者是否已經是成員
          const { data: membership } = await supabase
            .from('project_members')
            .select('id')
            .eq('project_id', project.id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (membership) {
            setSelectedProject(project); // 已是成員，直接跳轉
          } else {
            setTargetJoinProject(project); // 非成員，開啟認領
            setIsJoinModalOpen(true);
          }
        } catch (err) {
          console.error('處理邀請失敗:', err);
        } finally {
          // C. 清理 URL 與 Storage
          localStorage.removeItem('pending_invite_code');
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
      }
    };
    init();
  }, [user, refreshGlobalData, checkCategoriesStatus]);

  if (!user) return <AuthView />;

  return (
    <div className="app-main-layout">
      {isDataLoading && <LoadingScreen text="EasySplit" />}

      {/* 側邊欄遮罩 */}
      <div className={`sidebar-overlay ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)} />
      
      {/* 側邊欄 */}
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
                checkCategoriesStatus(); // ★ 優化：返回時刷新紅點狀態
              }} 
              personnel={personnel} 
              onRefresh={() => refreshGlobalData(user.id, true)} 
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
            onRefresh={checkCategoriesStatus} // ★ 關鍵：傳入回調，讓紅點能即時消失
          />
        )}
      </main>

      {/* --- 全量 Modals 區塊 --- */}
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
          onRefresh={() => { 
            refreshGlobalData(user.id, true); 
            setRefreshTrigger(prev => prev + 1); 
          }} 
        />
      )}
      
      <JoinProjectModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} project={targetJoinProject} user={user} onSuccess={(p) => { refreshGlobalData(user.id, true); setSelectedProject(p); }} />
      
      <ConfirmModal open={isLogoutConfirmOpen} title="確認登出系統？" content="登出後需重新登入才能繼續管理。" onConfirm={async () => { await signOut(); setIsLogoutConfirmOpen(false); }} onCancel={() => setIsLogoutConfirmOpen(false)} />
      
      <SetupProfileModal isOpen={isSetupModalOpen} user={user} onComplete={() => setIsSetupModalOpen(false)} />
    </div>
  );
}

export default App;