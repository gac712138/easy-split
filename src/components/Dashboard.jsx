import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, Plus, Calendar, ChevronRight, MoreVertical, Edit2, Trash2 
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient'; // 確保路徑正確
import { message } from 'antd';
import ConfirmModal from '../components/ConfirmModal'; // 引入確認彈窗

const Dashboard = ({ 
  projects, 
  loading, 
  onOpenMenu, 
  onOpenCreate, 
  onSelectProject, 
  onEditProject, 
  onRefresh // 刪除後刷新的回呼
}) => {
  // 1. 物理狀態管理：處理刪除目標
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 2. 實作刪除功能
  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);

    try {
      // 執行 Supabase 刪除
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) throw error;

      message.success(`專案「${deleteTarget.name}」已移除`);
      if (onRefresh) onRefresh(); // 成功後刷新清單
    } catch (err) {
      message.error('刪除失敗：' + err.message);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="app-main-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 1. 旗艦導航列：絕對置中標題 */}
      <header className="navbar" style={{ flexShrink: 0 }}>
        <button onClick={onOpenMenu} className="hamburger-btn">
          <Menu size={24} color="var(--color-text-main)"/>
        </button>
        <span className="nav-brand">EasySplit</span>
        <div style={{ width: 44 }}></div>
      </header>

      {/* 2. 內容捲動區 */}
      <main className="content-area-wrapper" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="band-container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
              我的分帳專案
            </h2>
            <button className="band-btn-main" onClick={onOpenCreate} style={{ padding: '10px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} />
              <span>建立專案</span>
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', color: 'var(--color-text-sub)', fontSize: '14px', fontWeight: '600' }}>
              正在同步樂團資料...
            </div>
          ) : projects.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {projects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onClick={() => onSelectProject(project)} 
                  onEdit={onEditProject}
                  onDelete={() => setDeleteTarget(project)} // 點擊刪除時設定目標
                />
              ))}
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed #333', padding: '60px 20px', borderRadius: '24px', textAlign: 'center' }}>
              <p style={{ color: 'var(--color-text-sub)', fontSize: '15px', fontWeight: '500' }}>目前還沒有專案，點擊右上角按鈕開始吧！</p>
            </div>
          )}
        </div>
      </main>

      {/* 3. 刪除確認彈窗 */}
      <ConfirmModal 
        open={!!deleteTarget}
        title="移除專案？"
        content={`確定要移除「${deleteTarget?.name}」嗎？這將會永久刪除此專案下的所有交易紀錄。`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </div>
  );
};

/**
 * 專案卡片 - 注入絕對定位選單邏輯
 */
const ProjectCard = ({ project, onClick, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const members = project.project_members?.map(pm => pm.personnel) || [];
  const formattedDate = new Date(project.created_at).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <div className="band-card" onClick={() => onClick(project)} style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '24px', marginBottom: '16px' }}>
      
      {/* 右上角操作按鈕 */}
      <button 
        style={{ position: 'absolute', top: '12px', right: '8px', background: 'none', border: 'none', padding: '8px', cursor: 'pointer', zIndex: 10 }}
        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
      >
        <MoreVertical size={20} color={showMenu ? 'var(--color-primary)' : 'var(--color-text-sub)'} />
      </button>

      {/* 絕對定位懸浮選單 */}
      {showMenu && (
        <div 
          ref={menuRef}
          className="absolute-floating-menu" 
          style={{ width: '150px', right: '12px', top: '48px', left: 'auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="selection-item" onClick={() => { onEdit(project); setShowMenu(false); }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Edit2 size={16} /> 編輯專案
            </div>
          </div>
          <div className="selection-item" style={{ color: '#ff6b6b' }} onClick={() => { onDelete(); setShowMenu(false); }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Trash2 size={16} /> 刪除專案
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-sub)', fontSize: '13px', fontWeight: '600' }}>
          <Calendar size={14} />
          <span>{formattedDate}</span>
        </div>

        <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#fff', margin: '4px 0', paddingRight: '24px' }}>
          {project.name || '未命名專案'}
        </h3>
        
        {/* 成員頭像疊加 */}
        <div style={{ display: 'flex', marginTop: '12px' }}>
          {members.slice(0, 5).map((m, i) => (
            <div key={m?.id || i} style={{ 
              width: 34, height: 34, borderRadius: '12px', background: '#252525', 
              border: '2px solid var(--color-bg-pill)', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', fontSize: '13px', fontWeight: '900', 
              marginLeft: i === 0 ? 0 : -10,
              color: i === 0 ? 'var(--color-primary)' : '#888',
              boxShadow: '4px 0 10px rgba(0,0,0,0.3)'
            }}>
              {m?.name ? m.name.charAt(0) : '?'}
            </div>
          ))}
          {members.length > 5 && (
            <div style={{ width: 34, height: 34, borderRadius: '12px', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#555', marginLeft: -10, border: '2px solid var(--color-bg-pill)', fontWeight: '900' }}>
              +{members.length - 5}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ background: 'rgba(58, 143, 183, 0.15)', color: 'var(--color-primary)', padding: '6px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '900' }}>
          進行中
        </div>
        <ChevronRight size={20} color="#333" strokeWidth={3} />
      </div>
    </div>
  );
};

export default Dashboard;