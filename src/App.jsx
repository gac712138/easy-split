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
import SecuritySettingsView from './views/SecuritySettingsView'; // 記得引入安全性頁面

// 彈窗組件
import CreateProjectModal from './components/CreateProjectModal';
import EditProjectModal from './components/EditProjectModal';
import AddTransactionModal from './components/AddTransactionModal'; 
import ConfirmModal from './components/ConfirmModal';
import JoinProjectModal from './components/JoinProjectModal'; 

// 動畫組件
import LoadingScreen from './components/LoadingScreen';
import './App.css';

function App() {
  const { user, signOut } = useAuth();

  /* --- 1. 物理狀態初始化 --- */
  const [currentView, setCurrentView] = useState('projects'); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);        
  const [selectedProject, setSelectedProject] = useState(null);
  const [editProject, setEditProject] = useState(null);

  /* --- 2. 全域資料狀態 --- */
  const [projects, setProjects] = useState([]);
  const [personnel, setPersonnel] = useState([]); 
  const [isDataLoading, setIsDataLoading] = useState(false);
  
  // Modal 狀態
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null); 
  
  // 加入專案相關狀態
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [targetJoinProject, setTargetJoinProject] = useState(null); 

  // 刷新訊號
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /* --- 3. 核心資料抓取 (V2 版) --- */
  const refreshGlobalData = useCallback(async (userId) => {
    if (!userId) return;
    setIsDataLoading(true);
    try {
      const [projRes, persRes] = await Promise.all([
        supabase.from('projects')
          .select('*') 
          .order('created_at', { ascending: false }),
          
        supabase.from('personnel')
          .select('*')
      ]);

      if (projRes.data) setProjects(projRes.data);
      if (persRes.data) setPersonnel(persRes.data);
    } catch (err) {
      console.error(err);
      message.error("資料同步失敗");
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  /* --- 4. 邀請連結攔截與處理 --- */
  const processInviteCode = async (code) => {
    const { data: project, error } = await supabase
      .rpc('get_project_by_invite_code', { code_input: code }) 
      .single();
    
    if (error || !project) {
        console.error('Invite code check failed:', error);
        message.error('邀請連結無效或專案不存在');
        localStorage.removeItem('pending_invite_code'); 
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }

    const { data: member } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', project.id)
      .eq('user_id', user.id)
      .maybeSingle();

    localStorage.removeItem('pending_invite_code');
    window.history.replaceState({}, document.title, window.location.pathname);

    if (member) {
        message.info(`你已經是「${project.name}」的成員囉！`);
        setSelectedProject(project); 
        return;
    }

    setTargetJoinProject(project);
    setIsJoinModalOpen(true);
  };

  /* --- 5. 初始化與監聽 (修正重點) --- */
  useEffect(() => {
    if (!user) {
      const root = document.documentElement.style;
      ['primary', 'bg', 'card', 'text-main', 'text-sub'].forEach(p => root.removeProperty(`--color-${p}`));
      return;
    }

    // ★ 強制重置 UI 狀態 (解決你的需求)
    setIsMenuOpen(false);       // 1. 確保側邊欄關閉
    setCurrentView('projects'); // 2. 確保回到專案列表
    setSelectedProject(null);   // 3. 確保沒有殘留的選中專案

    const init = async () => {
      // A. 載入主題
      const { data } = await supabase.from('user_settings').select('key, value').eq('user_id', user.id);
      if (data) {
        data.forEach(s => {
          const cssVar = `--color-${s.key.replace('theme_', '')}`;
          document.documentElement.style.setProperty(cssVar, s.value);
        });
      }
      
      // B. 載入資料
      await refreshGlobalData(user.id);

      // C. 檢查邀請碼
      const params = new URLSearchParams(window.location.search);
      const codeFromUrl = params.get('code');
      const codeFromStorage = localStorage.getItem('pending_invite_code');
      
      const codeToProcess = codeFromUrl || codeFromStorage;

      if (codeToProcess) {
        if (codeFromUrl) {
           localStorage.setItem('pending_invite_code', codeFromUrl);
        }
        await processInviteCode(codeToProcess);
      }
    };

    init();
  }, [user, refreshGlobalData]); // eslint-disable-line

  if (!user) return <AuthView />;

  return (
    <div className="app-main-layout">
      
      {/* 全域呼吸燈 */}
      {isDataLoading && <LoadingScreen text="EasySplit" />}

      {/* 側邊欄遮罩 */}
      <div 
        className={`sidebar-overlay ${isMenuOpen ? 'active' : ''}`} 
        onClick={() => setIsMenuOpen(false)} 
      />

      {/* 側邊欄 */}
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

      {/* 主內容區 */}
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
              onRefresh={() => refreshGlobalData(user.id)}
            />
          ) : (
            <ProjectDetailView 
              project={selectedProject} 
              onBack={() => setSelectedProject(null)} 
              personnel={personnel} 
              onRefresh={() => refreshGlobalData(user.id)}
              onAddTransaction={() => {
                setEditingTransaction(null);
                setIsAddTransactionOpen(true);
              }}
              onEditTransaction={(transaction) => {
                setEditingTransaction(transaction);
                setIsAddTransactionOpen(true);
              }}
              lastUpdated={refreshTrigger}
            />
          )
        ) : (
          <SettingsView onOpenMenu={() => setIsMenuOpen(true)} user={user} />
        )}
      </main>

      {/* --- 全域 Modals --- */}
      
      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        user={user} 
        onRefresh={() => refreshGlobalData(user.id)}
      />

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
          transaction={editingTransaction} 
          onRefresh={() => {
            refreshGlobalData(user.id);
            setRefreshTrigger(prev => prev + 1);
          }}
        />
      )}

      <JoinProjectModal 
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        project={targetJoinProject}
        user={user}
        onSuccess={(project) => {
          refreshGlobalData(user.id); 
          setSelectedProject(project); 
        }}
      />

      <ConfirmModal
        open={isLogoutConfirmOpen} 
        title="確認登出系統？" 
        content="登出後需重新登入才能繼續管理。"
        onConfirm={async () => { await signOut(); setIsLogoutConfirmOpen(false); }} 
        onCancel={() => setIsLogoutConfirmOpen(false)} 
      />
    </div>
  );
}

export default App;