import React from 'react';
import { Menu, Plus, Calendar, ChevronRight } from 'lucide-react';

const Dashboard = ({ projects, loading, onOpenMenu, onOpenCreate, onSelectProject }) => {
  return (
    <>
      {/* A. 頂部導航列 - 直接調用地基 .navbar */}
      <header className="navbar">
        <button onClick={onOpenMenu} className="hamburger-btn">
          <Menu size={24} color="var(--color-text-main)"/>
        </button>
        <span className="nav-brand">EasySplit</span>
        <div style={{ width: 40 }}></div>
      </header>

      {/* B. 內容區 - 使用地基 .band-container (或 .content-area) */}
      <main className="band-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
            我的分帳專案
          </h2>
          {/* 使用地基按鈕，補足寬度調整 */}
          <button className="band-btn-main" onClick={onOpenCreate} style={{ padding: '10px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={18} />
            <span>建立專案</span>
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--color-text-sub)', fontSize: '14px' }}>
            正在同步樂團資料...
          </div>
        ) : projects.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {projects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onClick={() => onSelectProject(project)} 
              />
            ))}
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed #333', padding: '60px 20px', borderRadius: '24px', textAlign: 'center' }}>
            <p style={{ color: '#555', fontSize: '15px' }}>目前還沒有專案，點擊右上角按鈕開始吧！</p>
          </div>
        )}
      </main>
    </>
  );
};

/**
 * 專案卡片 - 調用地基 .band-card 並在檔案內補足頭像疊加效果
 */
const ProjectCard = ({ project, onClick }) => {
  const members = project.project_members?.map(pm => pm.personnel) || [];
  const formattedDate = new Date(project.created_at).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });

  return (
    <div className="band-card" onClick={() => onClick(project)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* 1. 建立日期 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-sub)', fontSize: '13px', fontWeight: '500' }}>
          <Calendar size={14} strokeWidth={2.5} />
          <span>{formattedDate}</span>
        </div>

        {/* 2. 專案標題 */}
        <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#fff', margin: '4px 0', letterSpacing: '-0.01em' }}>
          {project.name || '未命名專案'}
        </h3>
        
        {/* 3. 成員頭像疊加 - 在檔案內補足物理排版細節 */}
        <div style={{ display: 'flex', marginTop: '12px' }}>
          {members.slice(0, 5).map((m, i) => (
            <div key={m?.id || i} style={{ 
              width: 34, height: 34, borderRadius: '12px', background: '#252525', 
              border: '2px solid var(--color-bg-pill)', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', fontSize: '13px', fontWeight: '800', 
              marginLeft: i === 0 ? 0 : -10, // 負邊距達成疊加感
              color: i === 0 ? 'var(--color-primary)' : '#888',
              boxShadow: '4px 0 10px rgba(0,0,0,0.2)'
            }}>
              {m?.name ? m.name.charAt(0) : '?'}
            </div>
          ))}
          {members.length > 5 && (
            <div style={{ width: 34, height: 34, borderRadius: '12px', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#555', marginLeft: -10, border: '2px solid var(--color-bg-pill)' }}>
              +{members.length - 5}
            </div>
          )}
        </div>
      </div>

      {/* 4. 狀態與進入箭頭 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'rgba(58, 143, 183, 0.1)', color: 'var(--color-primary)', padding: '6px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '900' }}>
          進行中
        </div>
        <ChevronRight size={22} color="#444" strokeWidth={3} />
      </div>
    </div>
  );
};

export default Dashboard;