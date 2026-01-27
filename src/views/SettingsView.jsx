import React, { useState } from 'react';
import { Menu, Users, Tags, Lock, ChevronRight, Palette } from 'lucide-react';
import PersonnelView from './PersonnelView';
import EventTypeMgmtView from './EventTypeMgmtView';
import ThemeSettingsView from './ThemeSettingsView'; // 1. 引入主題設定視圖

const SettingsView = ({ onOpenMenu, user, onRefresh }) => {
  const [subView, setSubView] = useState(null);

  // 1. 子視圖切換邏輯：確保每個頁面都能正確返回
  if (subView === 'personnel') return <PersonnelView onBack={() => setSubView(null)} user={user} onRefresh={onRefresh} />;
  
  if (subView === 'types') return <EventTypeMgmtView onBack={() => setSubView(null)} user={user} onRefresh={onRefresh} />;
  
  if (subView === 'theme') return <ThemeSettingsView onBack={() => setSubView(null)} user={user} />;

  return (
    <div className="app-main-layout" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 2. 標題與導航欄：高度鎖死 64px */}
      <header style={{ 
        height: '64px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 20px', 
        borderBottom: '1px solid #222',
        backgroundColor: 'var(--color-bg)' 
      }}>
        <button 
          onClick={onOpenMenu} 
          style={{ background: 'none', border: 'none', color: 'var(--color-text-main)', cursor: 'pointer', padding: '8px' }}
        >
          <Menu size={24}/>
        </button>
        
        <span style={{ 
          color: 'var(--color-text-main)', 
          fontWeight: 'bold', 
          letterSpacing: '1px',
          fontSize: '18px' 
        }}>
          系統設定
        </span>
        
        <div style={{ width: 40 }}></div>
      </header>

      {/* 3. 主內容區：套用 24px Padding */}
      <main style={{ padding: '24px', flex: 1, backgroundColor: 'var(--color-bg)' }}>
        
        {/* A. 人員名單管理 (User-level) */}
        <div className="settings-item-card" onClick={() => setSubView('personnel')}>
          <div className="settings-item-left">
            <Users size={20} color="var(--color-primary)" />
            <span>人員名單管理</span>
          </div>
          <ChevronRight size={18} color="var(--color-text-muted)" />
        </div>

        {/* B. 活動類型管理 (Categories) */}
        <div className="settings-item-card" onClick={() => setSubView('types')}>
          <div className="settings-item-left">
            <Tags size={20} color="var(--color-primary)" />
            <span>活動類型管理</span>
          </div>
          <ChevronRight size={18} color="var(--color-text-muted)" />
        </div>

        {/* C. 主題色設定 (綁定在 User) */}
        <div className="settings-item-card" onClick={() => setSubView('theme')}>
          <div className="settings-item-left">
            <Palette size={20} color="var(--color-primary)" />
            <span>主題色設定 (外觀)</span>
          </div>
          <ChevronRight size={18} color="var(--color-text-muted)" />
        </div>

        {/* D. 帳號密碼管理 (Auth) */}
        <div className="settings-item-card">
          <div className="settings-item-left">
            <Lock size={20} color="var(--color-primary)" />
            <span>帳號密碼管理</span>
          </div>
          <ChevronRight size={18} color="var(--color-text-muted)" />
        </div>

      </main>
    </div>
  );
};

export default SettingsView;