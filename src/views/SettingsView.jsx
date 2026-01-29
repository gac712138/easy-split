import React, { useState } from 'react';
import { 
  Menu, Tags, Palette, Lock, ChevronRight 
} from 'lucide-react';
import EventTypeMgmtView from './EventTypeMgmtView';
import ThemeSettingsView from './ThemeSettingsView'; 
import SecuritySettingsView from './SecuritySettingsView'; 
import LoadingScreen from '../components/LoadingScreen'; // ★ 引入 LoadingScreen

const SettingItem = ({ icon: Icon, label, onClick, showBadge }) => (
  <div 
    className="band-card" 
    onClick={onClick}
    style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 24px', marginBottom: '12px', cursor: 'pointer'
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
          width: '8px', height: '8px', background: '#ff6b6b', borderRadius: '50%',
          boxShadow: '0 0 8px rgba(255, 107, 107, 0.4)'
        }} />
      )}
      <ChevronRight size={18} color="var(--color-text-sub)" />
    </div>
  </div>
);

const SettingsView = ({ onOpenMenu, user, showBadge, onRefresh }) => {
  const [subView, setSubView] = useState(null);
  const [isSubLoading, setIsSubLoading] = useState(false); // ★ 新增轉場狀態

  // ★ 核心優化：帶動畫的轉場跳轉
  const navigateTo = (view) => {
    setIsSubLoading(true);
    // 設定 800ms 的鋼鐵脈衝轉場時間
    setTimeout(() => {
      setSubView(view);
      setIsSubLoading(false);
    }, 800);
  };

  if (subView === 'types') return <EventTypeMgmtView onBack={() => setSubView(null)} user={user} onRefresh={onRefresh} />;
  if (subView === 'theme') return <ThemeSettingsView onBack={() => setSubView(null)} user={user} />;
  if (subView === 'security') return <SecuritySettingsView onBack={() => setSubView(null)} user={user} />;

  return (
    <div className="app-main-layout">
      {/* ★ 轉場動畫遮罩：保留你原本的 Logo 設定 */}
      {isSubLoading && <LoadingScreen text="資料載入中" transparent={true} />}

      <div className="content-area-wrapper">
        <header className="navbar">
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
              icon={Tags} label="帳款類型管理" 
              onClick={() => navigateTo('types')} 
              showBadge={showBadge} 
            />
            <SettingItem 
              icon={Palette} label="主題外觀設定" 
              onClick={() => navigateTo('theme')} 
            />
            <SettingItem 
              icon={Lock} label="帳號安全性" 
              onClick={() => navigateTo('security')} 
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsView;