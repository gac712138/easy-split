import React from 'react';
import { Menu, Plus } from 'lucide-react';

const Dashboard = ({ onOpenMenu }) => {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid #222' }}>
        <button onClick={onOpenMenu} style={{ background: 'none', border: 'none', color: 'white' }}><Menu size={24}/></button>
        <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', letterSpacing: '1px' }}>EasySplit</span>
        <div style={{ width: 24 }}></div>
      </header>

      <main style={{ padding: '24px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '22px', margin: 0 }}>我的分帳專案</h2>
          <button className="band-btn-primary" style={{ width: 'auto', padding: '10px 20px', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} />
            <span style={{ fontSize: '14px' }}>建立新專案</span>
          </button>
        </div>

        <div style={{ backgroundColor: 'var(--color-card)', padding: '60px 20px', borderRadius: '24px', textAlign: 'center', border: '1px dashed #333' }}>
          <p style={{ color: 'var(--color-text-sub)', margin: 0 }}>目前還沒有專案，點擊按鈕開始吧！</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;