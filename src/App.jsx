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
      // V2 修正：RLS 自動篩選「擁有的」+「參與的」
      const [projRes, persRes] = await Promise.all([
        supabase.from('projects')
          .select('*') 
          .order('created_at', { ascending: false }),
          
        // V2 修正：RLS 自動篩選「我參與的專案」的人員
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

  /* --- 4. 邀請連結攔截與處理 (Deep Link Handler) --- */
  const processInviteCode = async (code) => {
    // ★ 關鍵修正：改用 RPC 安全函式檢查專案是否存在 (繞過 RLS)
    // 原本的 .from('projects')... 會因為新用戶還不是成員而被 RLS 擋住
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

    // B. 檢查是否已經是成員 (防呆)
    const { data: member } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', project.id)
      .eq('user_id', user.id)
      .maybeSingle();

    // 清除暫存代碼
    localStorage.removeItem('pending_invite_code');
    window.history.replaceState({}, document.title, window.location.pathname);

    if (member) {
        message.info(`你已經是「${project.name}」的成員囉！`);
        setSelectedProject(project); // 直接跳轉到該專案
        return;
    }

    // C. 通過檢查，打開認領彈窗
    setTargetJoinProject(project);
    setIsJoinModalOpen(true);
  };

  /* --- 5. 初始化與監聽 --- */
  useEffect(() => {
    if (!user) {
      const root = document.documentElement.style;
      ['primary', 'bg', 'card', 'text-main', 'text-sub'].forEach(p => root.removeProperty(`--color-${p}`));
      return;
    }

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

      // C. 檢查是否有「待處理的邀請」 (來自 URL 或 LocalStorage)
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
              
              // 傳入全域人員名單 (給 V2 查表用)
              personnel={personnel} 
              
              // 傳入刷新全域資料的 function，讓內層 Modal 可以更新
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
      
      {/* 1. 建立專案 */}
      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        user={user} 
        onRefresh={() => refreshGlobalData(user.id)}
      />

      {/* 2. 編輯專案 */}
      <EditProjectModal 
        isOpen={!!editProject}
        project={editProject}
        user={user}
        personnel={personnel}
        onClose={() => setEditProject(null)}
        onRefresh={() => refreshGlobalData(user.id)}
      />

      {/* 3. 新增/編輯帳務 */}
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

      {/* 4. 加入專案 (認領身分) 彈窗 */}
      <JoinProjectModal 
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        project={targetJoinProject}
        user={user}
        onSuccess={(project) => {
          refreshGlobalData(user.id); // 刷新列表
          setSelectedProject(project); // 直接進入該專案
        }}
      />

      {/* 5. 登出確認 */}
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