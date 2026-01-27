import React from 'react';
import { X, FolderKanban, LogOut } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, user, onSignOut }) => {
  return (
    <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <aside className="sidebar-drawer" onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '40px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div className="user-profile">
              <div style={{ width: 45, height: 45, borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px', marginBottom: '10px' }}>島</div>
              <div style={{ fontWeight: 'bold' }}>Andrew</div>
              <div style={{ color: 'var(--color-text-sub)', fontSize: '12px' }}>{user?.email}</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)' }}><X size={24}/></button>
          </div>

          <nav>
            <button className="sidebar-item active">
              <FolderKanban size={20} />
              <span>我的專案</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <button onClick={onSignOut} className="sidebar-item" style={{ color: 'var(--color-text-muted)' }}>
            <LogOut size={20} />
            <span>登出帳號</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;