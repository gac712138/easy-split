import React, { useState } from 'react';
import { 
  Menu, Users, Tags, Palette, Lock, ChevronRight, MessageSquare 
} from 'lucide-react';
import PersonnelView from './PersonnelView';
import EventTypeMgmtView from './EventTypeMgmtView';
import ThemeSettingsView from './ThemeSettingsView'; 

const SettingItem = ({ icon: Icon, label, onClick }) => (
  <div 
    className="band-card" 
    onClick={onClick}
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '18px 24px',
      marginBottom: '12px'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ 
        width: '44px', height: '44px', borderRadius: '14px',
        background: 'rgba(58, 143, 183, 0.1)', // 品牌色微光背景
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

  if (subView === 'personnel') return <PersonnelView onBack={() => setSubView(null)} user={user} />;
  if (subView === 'types') return <EventTypeMgmtView onBack={() => setSubView(null)} user={user} />;
  if (subView === 'theme') return <ThemeSettingsView onBack={() => setSubView(null)} user={user} />;

  return (
    /* 1. 物理地基外層：確保 100vw/100vh 佔滿 */
    <div className="app-main-layout">
      
      <div className="content-area-wrapper">
        {/* 2. 旗艦導航列：修正 image_244ada.png 的標題偏移問題 */}
        <header className="navbar">
          <button onClick={onOpenMenu} className="hamburger-btn">
            <Menu size={24} color="var(--color-text-main)"/>
          </button>
          
          <span className="nav-brand">系統設定</span>
          
          <div style={{ width: 44 }}></div> {/* 右側占位確保絕對置中 */}
        </header>

        {/* 3. 內容容器：使用 .band-container 限制 PC 寬度 */}
        <main className="band-container">
          <div style={{ padding: '24px 0' }}>
            
            <SettingItem 
              icon={Users} 
              label="人員名單管理" 
              onClick={() => setSubView('personnel')} 
            />

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

            <SettingItem 
              icon={Lock} 
              label="帳號安全性" 
              onClick={() => {}} 
            />
            
          </div>

        </main>
      </div>
    </div>
  );
};

export default SettingsView;