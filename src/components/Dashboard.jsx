import React from 'react';
import { Menu, Plus, Calendar, AlertCircle,ChevronRight } from 'lucide-react';


/**
 * Dashboard 組件：由 App.jsx 預載資料驅動
 */
const Dashboard = ({ projects, loading, onOpenMenu, onOpenCreate, onSelectProject }) => {
  return (
    <div className="app-main-layout">
      {/* 頂部導航列 - 統一 64px 高度 */}
      <header className="navbar">
        <button onClick={onOpenMenu} className="hamburger-btn">
          <Menu size={24} color="var(--color-text-main)"/>
        </button>
        <span className="nav-brand">EasySplit</span>
        <div style={{ width: 40 }}></div>
      </header>

      <main className="content-area">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
            我的分帳專案
          </h2>
          <button 
            className="band-btn-primary" 
            onClick={onOpenCreate} 
            style={{ width: 'auto', padding: '10px 16px', marginTop: 0 }}
          >
            <Plus size={18} />
            <span>建立專案</span>
          </button>
        </div>

        {/* 邏輯判定：優先顯示讀取狀態或列表 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-sub)' }}>
            讀取中...
          </div>
        ) : projects.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {projects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onClick={() => onSelectProject(project)} 
              />
            ))}
          </div>
        ) : (
          <div className="empty-state-card">
            <p>目前還沒有專案，點擊按鈕開始吧！</p>
          </div>
        )}
      </main>
    </div>
  );
};

/**
 * 專案卡片組件：顯示名稱、成員縮寫圓圈
 */
const ProjectCard = ({ project, onClick, onEdit }) => {
  const members = project.project_members?.map(pm => pm.personnel) || [];
  const formattedDate = new Date(project.created_at).toLocaleDateString();

  return (
    <div className="project-premium-card" onClick={() => onClick(project)}>
      {/* 右上角編輯按鈕 */}
      <button 
        className="card-edit-btn" 
        onClick={(e) => {
          e.stopPropagation(); // 防止觸發進入專案
          onEdit(project);
        }}
      >
        <AlertCircle size={24} />
      </button>

      <div className="card-left-section">
        {/* 主要文字：專案名稱 */}
        <h3 className="project-title-main">{project.name || '未命名專案'}</h3>
        
        {/* 次要文字：日期 */}
        <div className="project-date-sub">
          <Calendar size={16} />
          <span>{formattedDate}</span>
        </div>

        {/* 成員頭像：固定取第一個字 */}
        <div className="member-avatar-row">
          {members.slice(0, 5).map((m, i) => (
            <div key={m?.id || i} className="avatar-circle">
              {m?.name ? m.name.charAt(0) : '?'}
            </div>
          ))}
          {members.length > 5 && <div className="avatar-more">+{members.length - 5}</div>}
        </div>
      </div>

      <div className="card-right-section">
        {/* 狀態標籤：寫死進行中 */}
        <div className="status-badge-primary">進行中</div>
        <ChevronRight size={24} className="chevron-icon" />
      </div>
    </div>
  );
};

export default Dashboard;