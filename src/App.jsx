import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import AuthView from './views/AuthView';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CreateProjectModal from './components/CreateProjectModal';
import ConfirmModal from './components/ConfirmModal'; // 1. 引入改寫後的 Modal
import './App.css';

function App() {
  const { user, signOut } = useAuth();
  
  // 介面狀態管理
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false); // 2. 控制登出確認視窗
  const [isLoggingOut, setIsLoggingOut] = useState(false); // 處理登出中的 Loading 狀態

  // 1. 未登入：導向登入頁面
  if (!user) return <AuthView />;

  // 2. 建立專案邏輯 (後續對接 Supabase)
  const handleCreateProject = (data) => {
    console.log("收到新專案請求：", data);
    setIsCreateModalOpen(false);
  };

  // 3. 處理登出確認邏輯
  const handleSignOutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("登出失敗：", error);
    } finally {
      setIsLoggingOut(false);
      setIsLogoutConfirmOpen(false);
    }
  };

  return (
    <div className="app-main-layout">
      {/* 側邊導覽：將登出事件攔截到 Modal */}
      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        user={user} 
        onSignOut={() => setIsLogoutConfirmOpen(true)} // 3. 觸發二次確認
      />

      {/* 主畫面：傳遞 Modal 控制功能 */}
      <Dashboard 
        onOpenMenu={() => setIsMenuOpen(true)} 
        onOpenCreate={() => setIsCreateModalOpen(true)} 
      />

      {/* A. 新增專案的底部抽屜 */}
      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProject}
      />

      {/* B. 登出確認彈窗 (Ant Design 版) */}
      <ConfirmModal
        open={isLogoutConfirmOpen}
        title="確認要登出嗎？"
        content="登出後需要重新輸入帳號密碼才能管理你的分帳專案。"
        loading={isLoggingOut}
        okText="確認登出"
        cancelText="我再想想"
        isDanger={true} // 使用危險紅色
        onConfirm={handleSignOutConfirm}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />

      <footer className="footer-tagline">這群人真的很欠管</footer>
    </div>
  );
}

export default App;