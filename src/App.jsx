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
import ConfirmModal from './components/ConfirmModal';
import './App.css';

function App() {
  const { user, signOut } = useAuth();

  /* --- 1. 物理狀態初始化：確保登入後視圖正確 --- */
  const [currentView, setCurrentView] = useState('projects'); // 預設 Dashboard
  const [isMenuOpen, setIsMenuOpen] = useState(false);        // 預設選單收合
  const [selectedProject, setSelectedProject] = useState(null);
  const [editProject, setEditProject] = useState(null);

  /* --- 2. 全域資料狀態 --- */
  const [projects, setProjects] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  /* --- 3. 核心資料抓取：打通「點亮成員」的物理斷層 --- */
  const refreshGlobalData = useCallback(async (userId) => {
    if (!userId) return;
    setIsDataLoading(true);
    try {
      const [projRes, persRes] = await Promise.all([
        supabase.from('projects')
          .select(`*, project_members(personnel_id, personnel(*))`) // ★ 關鍵：補上 personnel_id
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
      // 登出時清理 CSS 變數，回歸預設地基顏色
      const root = document.documentElement.style;
      ['primary', 'bg', 'card', 'text-main', 'text-sub'].forEach(p => root.removeProperty(`--color-${p}`));
      return;
    }

    const loadThemeAndData = async () => {
      // A. 載入 KV 設定
      const { data } = await supabase.from('user_settings').select('key, value').eq('user_id', user.id);
      if (data) {
        data.forEach(s => {
          const cssVar = `--color-${s.key.replace('theme_', '')}`;
          document.documentElement.style.setProperty(cssVar, s.value);
        });
      }
      // B. 載入全域資料
      refreshGlobalData(user.id);
    };

    loadThemeAndData();
  }, [user, refreshGlobalData]);

  // 未登入狀態：導向物理隔離的 AuthView
  if (!user) return <AuthView />;

  return (
    <div className="app-main-layout">
      {/* 5. 側邊欄背景遮罩 */}
      <div 
        className={`sidebar-overlay ${isMenuOpen ? 'active' : ''}`} 
        onClick={() => setIsMenuOpen(false)} 
      />

      {/* 6. 側邊欄：導航後自動收合 */}
      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        user={user} 
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setSelectedProject(null);
          setIsMenuOpen(false); // 物理收合動作
        }} 
        onSignOut={() => setIsLogoutConfirmOpen(true)} 
      />

      {/* 7. 主內容區：Flex 佈局填充 */}
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