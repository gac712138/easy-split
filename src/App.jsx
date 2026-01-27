import React from 'react';
import { useAuth } from './context/AuthContext';
import AuthView from './views/AuthView';
import { LogOut, LayoutDashboard, PlusCircle } from 'lucide-react';
import './App.css';

function App() {
  const { user, signOut } = useAuth();

  // 1. 如果使用者尚未登入，顯示登入/註冊頁面
  if (!user) {
    return <AuthView />;
  }

  // 2. 登入後的畫面結構
  return (
    <div className="app-main-layout">
      {/* 導覽列 */}
      <nav className="navbar">
        <div className="nav-brand">
          <LayoutDashboard size={24} />
          <span>EasySplit</span>
        </div>
        <div className="nav-user">
          <span className="user-email">{user.email}</span>
          <button onClick={signOut} className="btn-icon-text">
            <LogOut size={18} />
            <span>登出</span>
          </button>
        </div>
      </nav>

      {/* 主內容區塊 */}
      <main className="content-area">
        <header className="page-header">
          <h2>我的分帳專案</h2>
          <button className="btn-add-project">
            <PlusCircle size={18} />
            <span>建立新專案</span>
          </button>
        </header>

        {/* 這裡是之後放置 ProjectList 的地方 */}
        <div className="project-grid-placeholder">
          <p>目前還沒有專案，點擊上方按鈕開始第一個分帳吧！</p>
        </div>
      </main>
    </div>
  );
}

export default App;