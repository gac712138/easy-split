import React from 'react';
import { Menu, Plus } from 'lucide-react';

const Dashboard = ({ onOpenMenu, onOpenCreate }) => {
  return (
    <div className="app-main-layout" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. 頂部導航列 - 採用你偏好的 64px 高度 */}
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
          color: 'var(--color-primary)', 
          fontWeight: 'bold', 
          letterSpacing: '1px',
          fontSize: '18px' 
        }}>
          EasySplit
        </span>
        
        <div style={{ width: 40 }}></div> {/* 為了視覺平衡的佔位 */}
      </header>

      {/* 2. 主內容區 */}
      <main style={{ padding: '24px', flex: 1, backgroundColor: 'var(--color-bg)' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '32px' 
        }}>
          <h2 style={{ fontSize: '22px', margin: 0, color: 'var(--color-text-main)' }}>
            我的分帳專案
          </h2>
          
          {/* 綁定開啟新增專案 Modal 的事件 */}
          <button 
            className="band-btn-primary" 
            onClick={onOpenCreate}
            style={{ 
              width: 'auto', 
              padding: '10px 20px', 
              marginTop: 0, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '14px'
            }}
          >
            <Plus size={18} />
            <span>建立新專案</span>
          </button>
        </div>

        {/* 3. 空狀態卡片 - 採用 24px 圓角與虛線邊框 */}
        <div style={{ 
          backgroundColor: 'var(--color-card)', 
          padding: '60px 20px', 
          borderRadius: '24px', 
          textAlign: 'center', 
          border: '1px dashed #333',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <p style={{ color: 'var(--color-text-sub)', margin: 0 }}>
            目前還沒有專案，點擊按鈕開始吧！
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;