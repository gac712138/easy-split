import React, { useState } from 'react';
import { 
  Menu, Users, Tags, Palette, Lock, ChevronRight, MessageSquare 
} from 'lucide-react';
import PersonnelView from './PersonnelView';
import EventTypeMgmtView from './EventTypeMgmtView';
import ThemeSettingsView from './ThemeSettingsView'; 

/**
 * 1. 統一的項目元件：確保 Icon 上下至中且顏色對齊
 */
const SettingItem = ({ icon: Icon, label, onClick }) => (
  <div className="settings-item-card" onClick={onClick}>
    <div className="settings-item-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      {/* 修正：Icon 與文字皆使用 var(--color-text-main) */}
      <Icon size={20} color="var(--color-text-main)" />
      <span style={{ color: 'var(--color-text-main)', fontSize: '16px', fontWeight: '500' }}>
        {label}
      </span>
    </div>
    {/* 修正：右側箭頭同步使用主文字色 */}
    <ChevronRight size={18} color="var(--color-text-main)" />
  </div>
);

const SettingsView = ({ onOpenMenu, user }) => {
  const [subView, setSubView] = useState(null);

  // 子視圖切換邏輯
  if (subView === 'personnel') return <PersonnelView onBack={() => setSubView(null)} user={user} />;
  if (subView === 'types') return <EventTypeMgmtView onBack={() => setSubView(null)} user={user} />;
  if (subView === 'theme') return <ThemeSettingsView onBack={() => setSubView(null)} user={user} />;

  return (
    <div className="app-main-layout">
      {/* 2. 歸一化 Header：64px 高度，移除分界線 */}
      <header className="navbar" style={{ borderBottom: 'none' }}>
        <button onClick={onOpenMenu} className="hamburger-btn">
          <Menu size={24} color="var(--color-text-main)"/>
        </button>
        <span style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          color: 'var(--color-text-main)' 
        }}>
          系統設定
        </span>
        <div style={{ width: 40 }}></div>
      </header>

      {/* 3. 內容區域：24px 內距，藥丸卡片堆疊 */}
      <main className="content-area">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          
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
            label="主題配色設定 (外觀)" 
            onClick={() => setSubView('theme')} 
          />

          <SettingItem 
            icon={MessageSquare} 
            label="Discord 頻道管理" 
            onClick={() => { /* 這裡串接 Discord 邏輯 */ }} 
          />

          <SettingItem 
            icon={Lock} 
            label="帳號密碼管理" 
            onClick={() => { /* 這裡串接密碼修改彈窗 */ }} 
          />
          
        </div>
      </main>
    </div>
  );
};

export default SettingsView;