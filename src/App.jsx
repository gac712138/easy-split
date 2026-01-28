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
  const [personnel, setPersonnel] = useState([]); // ★ 這是關鍵名單
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // 帳務彈窗相關狀態
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null); 
  
  // 刷新訊號
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /* --- 3. 核心資料抓取 --- */
  const refreshGlobalData = useCallback(async (userId) => {
    if (!userId) return;
    setIsDataLoading(true);
    try {
      const [projRes, persRes] = await Promise.all([
        supabase.from('projects')
          .select(`*, project_members(personnel_id, personnel(*))`) 
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase.from('personnel')
          .select('*')
          .eq('user_id', userId)
          .order('sort_order', { ascending: true })
      ]);

      if (projRes.data) setProjects(projRes.data);
      if (persRes.data) setPersonnel(persRes.data);
    } catch (err) {
      message.error("資料同步失敗");
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  /* --- 4. 主題配色與資料載入監聽 --- */
  useEffect(() => {
    if (!user) {
      const root = document.documentElement.style;
      ['primary', 'bg', 'card', 'text-main', 'text-sub'].forEach(p => root.removeProperty(`--color-${p}`));
      return;
    }

    const loadThemeAndData = async () => {
      const { data } = await supabase.from('user_settings').select('key, value').eq('user_id', user.id);
      if (data) {
        data.forEach(s => {
          const cssVar = `--color-${s.key.replace('theme_', '')}`;
          document.documentElement.style.setProperty(cssVar, s.value);
        });
      }
      refreshGlobalData(user.id);
    };

    loadThemeAndData();
  }, [user, refreshGlobalData]);

  if (!user) return <AuthView />;

  return (
    <div className="app-main-layout">
      {/* 5. 側邊欄背景遮罩 */}
      <div 
        className={`sidebar-overlay ${isMenuOpen ? 'active' : ''}`} 
        onClick={() => setIsMenuOpen(false)} 
      />

      {/* 6. 側邊欄 */}
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

      {/* 7. 主內容區 */}
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
              
              // ★★★ 關鍵修正：必須傳入 personnel，否則詳情頁無法對照名字 ★★★
              personnel={personnel} 

              // 點擊新增按鈕
              onAddTransaction={() => {
                setEditingTransaction(null);
                setIsAddTransactionOpen(true);
              }}
              
              // 點擊列表卡片編輯
              onEditTransaction={(transaction) => {
                setEditingTransaction(transaction);
                setIsAddTransactionOpen(true);
              }}

              // 傳遞刷新訊號
              lastUpdated={refreshTrigger}
            />
          )
        ) : (
          <SettingsView onOpenMenu={() => setIsMenuOpen(true)} user={user} />
        )}
      </main>

      {/* 8. 全域 Modal 掛載點 */}
      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        user={user} 
        personnel={personnel}
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

      {/* 掛載新增/編輯帳務彈窗 */}
      {selectedProject && (
        <AddTransactionModal
          isOpen={isAddTransactionOpen}
          onClose={() => setIsAddTransactionOpen(false)}
          project={selectedProject}
          personnel={personnel}
          user={user}
          transaction={editingTransaction} 
          
          // 存檔成功後，更新全域資料並發送刷新訊號
          onRefresh={() => {
            refreshGlobalData(user.id);
            setRefreshTrigger(prev => prev + 1);
          }}
        />
      )}

      <ConfirmModal
        open={isLogoutConfirmOpen} 
        title="確認登出系統？" 
        content="登出後需重新登入才能繼續管理 Tiger Island 的專案資料。"
        onConfirm={async () => { await signOut(); setIsLogoutConfirmOpen(false); }} 
        onCancel={() => setIsLogoutConfirmOpen(false)} 
      />
    </div>
  );
}

export default App;