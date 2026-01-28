import React, { useState } from 'react';
import { 
  Menu, Tags, Palette, Lock, ChevronRight, MessageSquare 
} from 'lucide-react';
// import PersonnelView from './PersonnelView'; // 移除
import EventTypeMgmtView from './EventTypeMgmtView';
import ThemeSettingsView from './ThemeSettingsView'; 
import SecuritySettingsView from './SecuritySettingsView'; // ★ 新增引入

const SettingItem = ({ icon: Icon, label, onClick }) => (
  <div 
    className="band-card" 
    onClick={onClick}
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '18px 24px',
      marginBottom: '12px',
      cursor: 'pointer'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ 
        width: '44px', height: '44px', borderRadius: '14px',
        background: 'rgba(58, 143, 183, 0.1)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={20} color="var(--color-primary)" />
      </div>
      <span style={{ color: 'var(--color-text-main)', fontSize: '16px', fontWeight: '800' }}>
        {label}
      </span>
    </div>
    <ChevronRight size={18} color="var(--color-text-sub)" />
  </div>
);

const SettingsView = ({ onOpenMenu, user }) => {
  const [subView, setSubView] = useState(null);

  // if (subView === 'personnel') return <PersonnelView onBack={() => setSubView(null)} user={user} />; // 移除
  if (subView === 'types') return <EventTypeMgmtView onBack={() => setSubView(null)} user={user} />;
  if (subView === 'theme') return <ThemeSettingsView onBack={() => setSubView(null)} user={user} />;
  
  // ★ 新增：安全性頁面路由
  if (subView === 'security') return <SecuritySettingsView onBack={() => setSubView(null)} user={user} />;

  return (
    <div className="app-main-layout">
      
      <div className="content-area-wrapper">
        <header className="navbar">
          <button onClick={onOpenMenu} className="hamburger-btn">
            <Menu size={24} color="var(--color-text-main)"/>
          </button>
          
          <span className="nav-brand">系統設定</span>
          
          <div style={{ width: 44 }}></div> 
        </header>

        <main className="band-container">
          <div style={{ padding: '24px 0' }}>
            
            {/* 移除人員名單管理 */}

            <SettingItem 
              icon={Tags} 
              label="活動類型管理" 
              onClick={() => setSubView('types')} 
            />

            <SettingItem 
              icon={Palette} 
              label="主題外觀設定" 
              onClick={() => setSubView('theme')} 
            />

            <SettingItem 
              icon={MessageSquare} 
              label="Discord 頻道串接" 
              onClick={() => {}} 
            />

            {/* 串接安全性頁面 */}
            <SettingItem 
              icon={Lock} 
              label="帳號安全性" 
              onClick={() => setSubView('security')} 
            />
            
          </div>

        </main>
      </div>
    </div>
  );
};

export default SettingsView;