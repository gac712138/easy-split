import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import AuthView from './views/AuthView';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 未登入顯示登入頁面
  if (!user) return <AuthView />;

  return (
    <div className="app-main-layout">
      {/* 側邊導覽選單 */}
      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        user={user} 
        onSignOut={signOut} 
      />

      {/* 主畫面內容 */}
      <Dashboard onOpenMenu={() => setIsMenuOpen(true)} />

      {/* 底部固定字樣 */}
      <footer className="footer-tagline">這群人真的很欠管</footer>
    </div>
  );
}

export default App;