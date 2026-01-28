import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, Plus, Calendar, ChevronRight, MoreVertical, Edit2, Trash2, Crown, User 
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient'; 
import { message } from 'antd';
import ConfirmModal from '../components/ConfirmModal'; 

const Dashboard = ({ 
  user, 
  projects, 
  loading, 
  onOpenMenu, 
  onOpenCreate, 
  onSelectProject, 
  onEditProject, 
  onRefresh 
}) => {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) throw error;

      message.success(`專案「${deleteTarget.name}」已移除`);
      if (onRefresh) onRefresh(); 
    } catch (err) {
      message.error('刪除失敗：' + err.message);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="app-main-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header className="navbar" style={{ flexShrink: 0 }}>
        <button onClick={onOpenMenu} className="hamburger-btn">
          <Menu size={24} color="var(--color-text-main)"/>
        </button>
        <span className="nav-brand">EasySplit</span>
        <div style={{ width: 44 }}></div>
      </header>

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
                  user={user} 
                  onClick={() => onSelectProject(project)} 
                  onEdit={onEditProject}
                  onDelete={() => setDeleteTarget(project)} 
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
 * 專案卡片 Component
 */
const ProjectCard = ({ project, user, onClick, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const members = project.project_members?.map(pm => pm.personnel) || [];
  const formattedDate = new Date(project.created_at).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });

  // 1. 判斷權限
  const isOwner = user?.id === project.user_id;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // ★ 2. 復原：動態產生狀態標籤的函式
  const getStatusBadge = (status) => {
    const currentStatus = status || 'active';
    const config = {
      active: { text: '進行中', color: '#4caf50', bg: 'rgba(76, 175, 80, 0.15)', border: 'rgba(76, 175, 80, 0.2)' },
      settling: { text: '結算中', color: '#ffc107', bg: 'rgba(255, 193, 7, 0.15)', border: 'rgba(255, 193, 7, 0.2)' },
      archived: { text: '已結束', color: '#9e9e9e', bg: 'rgba(158, 158, 158, 0.15)', border: 'rgba(158, 158, 158, 0.2)' }
    };
    const style = config[currentStatus] || config.active;

    return (
      <div style={{ 
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 10px', 
        borderRadius: '20px', 
        fontSize: '12px', 
        fontWeight: '800',
        backgroundColor: style.bg, 
        color: style.color,
        border: `1px solid ${style.border}`,
        whiteSpace: 'nowrap' // 確保標籤內文字不換行
      }}>
        {style.text}
      </div>
    );
  };

  return (
    <div className="band-card" onClick={() => onClick(project)} style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '24px', marginBottom: '16px' }}>
      
      {/* 只有 Owner 才顯示操作選單 */}
      {isOwner && (
        <button 
          style={{ position: 'absolute', top: '12px', right: '8px', background: 'none', border: 'none', padding: '8px', cursor: 'pointer', zIndex: 10 }}
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
        >
          <MoreVertical size={20} color={showMenu ? 'var(--color-primary)' : 'var(--color-text-sub)'} />
        </button>
      )}

      {/* 懸浮選單 */}
      {showMenu && isOwner && (
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

      {/* ★ 關鍵修改 1：父容器加入 minWidth: 0
        這是 Flexbox 的重要設定，讓內部的文字截斷 (ellipsis) 能夠生效，不會把容器撐開
      */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-sub)', fontSize: '13px', fontWeight: '600' }}>
          <Calendar size={14} />
          <span>{formattedDate}</span>
        </div>

        {/* ★ 關鍵修改 2：標題樣式調整
          - whiteSpace: 'nowrap' (不換行)
          - overflow: 'hidden' (超出隱藏)
          - textOverflow: 'ellipsis' (顯示點點點)
        */}
        <h3 
          style={{ 
            fontSize: '22px', 
            fontWeight: '900', 
            color: '#fff', 
            margin: '4px 0', 
            paddingRight: '24px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          title={project.name}
        >
          {project.name || '未命名專案'}
        </h3>
        
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

      {/* 卡片右側膠囊群組 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
        
        {/* A. 身份膠囊 */}
        <div style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 10px', 
          borderRadius: '20px', 
          fontSize: '12px', 
          fontWeight: '800',
          backgroundColor: isOwner 
            ? 'color-mix(in srgb, var(--color-primary), transparent 85%)' 
            : 'rgba(56, 189, 248, 0.15)',
          color: isOwner 
            ? 'var(--color-primary)' 
            : '#38bdf8',
          border: isOwner 
            ? '1px solid color-mix(in srgb, var(--color-primary), transparent 80%)'
            : '1px solid rgba(56, 189, 248, 0.2)',
          whiteSpace: 'nowrap'
        }}>
          {isOwner ? <Crown size={12} strokeWidth={3} /> : <User size={12} strokeWidth={3} />}
          {isOwner ? '擁有者' : '協作者'}
        </div>

        {/* B. 狀態膠囊 (動態渲染) */}
        {getStatusBadge(project.status)}
        
        <ChevronRight size={20} color="#333" strokeWidth={3} />
      </div>
    </div>
  );
};

export default Dashboard;