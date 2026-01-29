import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, Plus, Calendar, MoreVertical, Edit2, Trash2, Crown, User 
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient'; 
import { message } from 'antd';
import ConfirmModal from '../components/ConfirmModal'; 
import ScrollObserver from './ScrollObserver'; 
import InviteHandler from './InviteHandler'; 
import JoinProjectModal from '../components/JoinProjectModal'; // ★ 引入既有的認領元件

const Dashboard = ({ 
  user, 
  projects, 
  loading, 
  onOpenMenu, 
  onOpenCreate, 
  onSelectProject, 
  onEditProject, 
  onRefresh,
  onLoadMore,
  hasMore,
  isFetchingMore
}) => {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ★ 認領流程專用狀態
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [invitationProject, setInvitationProject] = useState(null);

  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('projects').delete().eq('id', deleteTarget.id);
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
      
      {/* ★ 邀請碼邏輯元件：負責偵測並回傳專案資料給 Dashboard */}
      <InviteHandler 
        user={user} 
        onInvitationDetected={(projectData) => {
          setInvitationProject(projectData);
          setIsJoinModalOpen(true);
        }}
        onAlreadyMember={(projectData) => {
          // 如果已經是成員，直接進入該專案
          onSelectProject(projectData);
        }}
      />

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
              正在同步專案資料...
            </div>
          ) : projects.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              <ScrollObserver onIntersect={onLoadMore} hasMore={hasMore} loading={isFetchingMore} />
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed #333', padding: '60px 20px', borderRadius: '24px', textAlign: 'center' }}>
              <p style={{ color: 'var(--color-text-sub)', fontSize: '15px', fontWeight: '500' }}>目前還沒有專案，點擊右上角按鈕開始吧！</p>
            </div>
          )}
        </div>
      </main>

      {/* ★ 認領與加入視窗：由 InviteHandler 觸發開啟 */}
      <JoinProjectModal 
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        project={invitationProject}
        user={user}
        onSuccess={(project) => {
          if (onRefresh) onRefresh(); 
          onSelectProject(project); // 加入/認領成功後，直接進入該專案
          setIsJoinModalOpen(false);
        }}
      />

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

// ... ProjectCard 維持不變 ...
const ProjectCard = ({ project, user, onClick, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const members = project.project_members?.map(pm => pm.personnel) || [];
  const formattedDate = new Date(project.created_at).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const isOwner = user?.id === project.user_id;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const getStatusBadge = (status) => {
    const config = {
      active: { text: '進行中', color: '#4caf50', bg: 'rgba(76, 175, 80, 0.15)', border: 'rgba(76, 175, 80, 0.2)' },
      settling: { text: '結算中', color: '#ffc107', bg: 'rgba(255, 193, 7, 0.15)', border: 'rgba(255, 193, 7, 0.2)' },
      archived: { text: '已結束', color: '#9e9e9e', bg: 'rgba(158, 158, 158, 0.15)', border: 'rgba(158, 158, 158, 0.2)' }
    };
    const style = config[status || 'active'] || config.active;
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', backgroundColor: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
        {style.text}
      </div>
    );
  };

  return (
    <div className="band-card" onClick={() => onClick(project)} style={{ position: 'relative', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {isOwner && (
        <button style={{ position: 'absolute', top: '16px', right: '12px', background: 'none', border: 'none', padding: '4px', cursor: 'pointer', zIndex: 10 }} onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}>
          <MoreVertical size={20} color={showMenu ? 'var(--color-primary)' : 'var(--color-text-sub)'} />
        </button>
      )}
      {showMenu && (
        <div ref={menuRef} className="absolute-floating-menu" style={{ width: '150px', right: '12px', top: '48px', left: 'auto' }} onClick={(e) => e.stopPropagation()}>
          <div className="selection-item" onClick={() => { onEdit(project); setShowMenu(false); }}><Edit2 size={16} /> 編輯專案</div>
          <div className="selection-item" style={{ color: '#ff6b6b' }} onClick={() => { onDelete(); setShowMenu(false); }}><Trash2 size={16} /> 刪除專案</div>
        </div>
      )}
<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <div style={{ 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '4px', 
    padding: '4px 8px', 
    borderRadius: '6px', 
    fontSize: '11px', 
    fontWeight: '800', 
    // ★ 擁有者顏色寫死紅色 (#ff4d4f)，背景套用 85% 透明度
    backgroundColor: isOwner 
      ? 'color-mix(in srgb, #ff4d4f, transparent 85%)' 
      : 'rgba(56, 189, 248, 0.15)', 
    // ★ 文字顏色同步寫死紅色
    color: isOwner ? '#ff4d4f' : '#38bdf8', 
    // ★ 邊框同步寫死紅色，套用 80% 透明度
    border: isOwner 
      ? '1px solid color-mix(in srgb, #ff4d4f, transparent 80%)' 
      : '1px solid rgba(56, 189, 248, 0.2)' 
  }}>
    {isOwner ? <Crown size={11} strokeWidth={3} /> : <User size={11} strokeWidth={3} />} 
    {isOwner ? '擁有者' : '協作者'}
  </div>
  {getStatusBadge(project.status)}
</div>
      <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '30px' }}>{project.name || '未命名專案'}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-sub)', fontSize: '13px', fontWeight: '600' }}>
          <Calendar size={14} /> <span>{formattedDate}</span>
        </div>
        <div style={{ display: 'flex' }}>
          {members.slice(0, 5).map((m, i) => (
            <div key={m?.id || i} style={{ width: 24, height: 24, borderRadius: '8px', background: '#252525', border: '1px solid var(--color-bg-pill)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900', marginLeft: i === 0 ? 0 : -6, color: i === 0 ? 'var(--color-primary)' : '#888' }}>{m?.name ? m.name.charAt(0) : '?'}</div>
          ))}
          {members.length > 5 && <div style={{ width: 24, height: 24, borderRadius: '8px', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#555', marginLeft: -6, border: '1px solid var(--color-bg-pill)', fontWeight: '900' }}>+{members.length - 5}</div>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;