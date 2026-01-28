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

  // 狀態樣式
  const getStatusBadge = (status) => {
    const currentStatus = status || 'active';
    const config = {
      active: { text: '進行中', color: '#4caf50', bg: 'rgba(76, 175, 80, 0.15)' },
      settling: { text: '結算中', color: '#ffc107', bg: 'rgba(255, 193, 7, 0.15)' },
      archived: { text: '已結束', color: '#9e9e9e', bg: 'rgba(158, 158, 158, 0.15)' }
    };
    const style = config[currentStatus] || config.active;

    return (
      <span style={{
        fontSize: '11px',
        padding: '4px 8px',
        borderRadius: '6px',
        backgroundColor: style.bg,
        color: style.color,
        fontWeight: 'bold',
        display: 'inline-block',
        alignSelf: 'flex-start',
        marginBottom: '6px'
      }}>
        {style.text}
      </span>
    );
  };

  return (
    <div 
      className="band-card" 
      onClick={() => onClick(project)} 
      style={{ position: 'relative' }} 
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
          e.stopPropagation(); 
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
            left: 'auto' 
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

      {/* 專案卡片內容 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
        
        {getStatusBadge(project.status)}

        {/* ★★★ 修改這裡：標題單行省略樣式 ★★★ */}
        <h3 
          style={{ 
            fontSize: '18px', 
            fontWeight: '900', 
            color: '#fff', 
            paddingRight: '30px', // 預留空間給右上角選單，避免文字蓋到按鈕
            margin: 0,
            
            // 核心截斷語法
            whiteSpace: 'nowrap',       // 強制不換行
            overflow: 'hidden',         // 超出範圍隱藏
            textOverflow: 'ellipsis',   // 超出部分顯示 ...
            maxWidth: '100%',           // 確保寬度不超過父層
            display: 'block'            // 確保佔滿一行
          }}
          // 用 title 屬性讓滑鼠移過去時顯示完整名稱
          title={project.name}
        >
          {project.name}
        </h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--color-text-sub)', fontSize: '13px', marginTop: '4px' }}>
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