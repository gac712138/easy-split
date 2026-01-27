import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, Trash2, Calendar, Users } from 'lucide-react';

const ProjectCard = ({ project, onClick, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // 點擊外面自動關閉選單
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      className="band-card" 
      onClick={() => onClick(project)} 
      style={{ position: 'relative' }} // 確保右上角定位基準
    >
      {/* 右上角更多按鈕 */}
      <button 
        className="hamburger-btn" 
        style={{ 
          position: 'absolute', 
          top: '12px', 
          right: '8px', 
          zIndex: 10,
          padding: '8px'
        }}
        onClick={(e) => {
          e.stopPropagation(); // 防止點擊選單觸發進入專案
          setShowMenu(!showMenu);
        }}
      >
        <MoreVertical size={20} color="var(--color-text-sub)" />
      </button>

      {/* 絕對定位懸浮選單 */}
      {showMenu && (
        <div 
          ref={menuRef}
          className="absolute-floating-menu" 
          style={{ 
            width: '140px', 
            right: '8px', 
            top: '45px', 
            left: 'auto' // 覆寫地基的 left: 0
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="selection-item" onClick={() => { onEdit(project); setShowMenu(false); }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Edit2 size={16} /> 編輯資訊
            </div>
          </div>
          <div 
            className="selection-item" 
            style={{ color: '#ff6b6b' }} 
            onClick={() => { onDelete(project); setShowMenu(false); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Trash2 size={16} /> 刪除專案
            </div>
          </div>
        </div>
      )}

      {/* 原本的專案卡片內容 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#fff', paddingRight: '30px' }}>
          {project.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--color-text-sub)', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={14} /> {project.date || '未定日期'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={14} /> {project.project_members?.length || 0} 人
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;