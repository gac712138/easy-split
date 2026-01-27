import React, { useState, useEffect } from 'react';
import { X, Users, Check, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';
import dayjs from 'dayjs';
import ResponsiveDatePicker from './ResponsiveDatePicker'; 

const EditProjectModal = ({ isOpen, onClose, project, personnel = [], user, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  
  // participants 存放的是「發光」的成員 ID 陣列
  const [formData, setFormData] = useState({ name: '', date: '', participants: [] });

  // ★ 物理修正 1：精準提取 ID，並增加 dependency 確保同步 ★
  useEffect(() => {
    if (isOpen && project) {
      // 確保從 project_members 提取出純 ID 陣列
      const ids = project.project_members?.map(pm => pm.personnel_id) || [];
      
      console.log("初始化點亮 ID:", ids); // Andrew 你可以看 Console 確認有沒有抓到

      setFormData({
        name: project.name || '',
        date: project.created_at ? dayjs(project.created_at).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        participants: ids // 這裡塞入後，下方 includes 才會變 true
      });
    }
  }, [isOpen, project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !formData.name.trim()) return;
    setLoading(true);
    try {
      await supabase.from('projects').update({ name: formData.name.trim(), created_at: formData.date }).eq('id', project.id);
      await supabase.from('project_members').delete().eq('project_id', project.id);
      if (formData.participants.length > 0) {
        const payload = formData.participants.map(pid => ({ project_id: project.id, personnel_id: pid, user_id: user.id }));
        await supabase.from('project_members').insert(payload);
      }
      message.success('專案人員已重新對齊');
      onClose();
      onRefresh();
    } catch (err) { message.error('儲存失敗'); } 
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className={`drawer-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="drawer-container" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
        <div className="sheet-indicator" style={{ margin: '0 auto 20px' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>編輯專案</h3>
          <button onClick={onClose} className="hamburger-btn"><X size={24}/></button>
        </div>

        {/* 專案標題大字 */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <input 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            style={{ 
              background: 'transparent', border: 'none', fontSize: '32px', 
              fontWeight: '900', color: 'var(--color-primary)', width: '100%', 
              textAlign: 'center', outline: 'none'
            }} 
          />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ResponsiveDatePicker 
            value={dayjs(formData.date)} 
            onChange={(val) => setFormData({...formData, date: val.format('YYYY-MM-DD')})}
          />

          {/* ★ 點亮邏輯區 ★ */}
          <div className="overlay-anchor" style={{ marginBottom: '24px' }}>
            <div 
              className="band-input-pill" 
              onClick={() => setActiveMenu(activeMenu === 'members' ? null : 'members')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ color: '#888', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16}/> 專案成員
              </div>
              <div style={{ color: 'var(--color-primary)', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '4px' }}>
                已選 {formData.participants.length} 人 <ChevronDown size={14} />
              </div>
            </div>

            {activeMenu === 'members' && (
              <div className="absolute-floating-menu is-upwards">
                {personnel.map(p => {
                  // ★ 關鍵：確保 ID 比較排除型別干擾 ★
                  const isHighlighted = formData.participants.some(id => String(id) === String(p.id));
                  
                  return (
                    <div 
                      key={p.id} 
                      className={`selection-item ${isHighlighted ? 'active' : ''}`} 
                      onClick={() => {
                        const next = isHighlighted 
                          ? formData.participants.filter(id => String(id) !== String(p.id)) 
                          : [...formData.participants, p.id];
                        setFormData({...formData, participants: next});
                      }}
                    >
                      <span style={{ fontWeight: isHighlighted ? '900' : '500' }}>{p.name}</span>
                      {isHighlighted && <Check size={18} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button type="submit" className="band-btn-main" style={{ width: '100%' }} disabled={loading}>
            {loading ? '正在同步...' : '確認儲存編輯'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;