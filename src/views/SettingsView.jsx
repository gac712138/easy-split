import React, { useState } from 'react';
import { 
  Menu, Tags, Palette, Lock, ChevronRight, MessageSquare 
} from 'lucide-react';
import EventTypeMgmtView from './EventTypeMgmtView';
import ThemeSettingsView from './ThemeSettingsView'; 
import SecuritySettingsView from './SecuritySettingsView'; 

/**
 * 設定項目元件
 * @param {boolean} showBadge - 是否顯示提醒紅點
 */
const SettingItem = ({ icon: Icon, label, onClick, showBadge }) => (
  <div 
    className="band-card" 
    onClick={onClick}
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '18px 24px',
      marginBottom: '12px',
      cursor: 'pointer',
      position: 'relative'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      <div style={{ 
        width: '44px', height: '44px', borderRadius: '14px',
        background: 'rgba(58, 143, 183, 0.15)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={20} color="var(--color-primary)" />
      </div>
      <span style={{ color: 'var(--color-text-main)', fontSize: '16px', fontWeight: '800' }}>
        {label}
      </span>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {showBadge && (
        <span style={{ 
          width: '8px', 
          height: '8px', 
          background: '#ff6b6b', 
          borderRadius: '50%',
          boxShadow: '0 0 8px rgba(255, 107, 107, 0.4)'
        }} />
      )}
      <ChevronRight size={18} color="var(--color-text-sub)" />
    </div>
  </div>
);

// ★ 增加 onRefresh 到參數列
const SettingsView = ({ onOpenMenu, user, showBadge, onRefresh }) => {
  const [subView, setSubView] = useState(null);

  // 子頁面路由
  // ★ 關鍵修正：將 onRefresh 傳給 EventTypeMgmtView
  if (subView === 'types') {
    return (
      <EventTypeMgmtView 
        onBack={() => setSubView(null)} 
        user={user} 
        onRefresh={onRefresh} 
      />
    );
  }
  
  if (subView === 'theme') return <ThemeSettingsView onBack={() => setSubView(null)} user={user} />;
  if (subView === 'security') return <SecuritySettingsView onBack={() => setSubView(null)} user={user} />;

  return (
    <div className="app-main-layout">
      
      <div className="content-area-wrapper">
        <header className="navbar">
          {/* ★ 漢堡按鈕紅點同步 */}
          <button onClick={onOpenMenu} className="hamburger-btn" style={{ position: 'relative' }}>
            <Menu size={24} color="var(--color-text-main)"/>
            {showBadge && (
              <span style={{ 
                position: 'absolute', top: '8px', right: '8px',
                width: '10px', height: '10px', 
                background: '#ff6b6b', borderRadius: '50%',
                border: '2px solid var(--color-bg-main)',
                boxShadow: '0 0 8px rgba(255, 107, 107, 0.5)'
              }} />
            )}
          </button>
          
          <span className="nav-brand">系統設定</span>
          
          <div style={{ width: 44 }}></div> 
        </header>

        <main className="band-container">
          <div style={{ padding: '24px 0' }}>
            
            <SettingItem 
              icon={Tags} 
              label="帳款類型管理" 
              onClick={() => setSubView('types')} 
              showBadge={showBadge} 
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
              onClick={() => setSubView('security')} 
            />
            
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsView;