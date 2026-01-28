import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react'; // 移除了 Users, Check, ChevronDown (用不到了)
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';
import dayjs from 'dayjs';
import ResponsiveDatePicker from './ResponsiveDatePicker'; 

const EditProjectModal = ({ isOpen, onClose, project, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  
  // ★ 簡化狀態：只保留 名稱 與 日期
  const [formData, setFormData] = useState({ name: '', date: '' });

  useEffect(() => {
    if (isOpen && project) {
      setFormData({
        name: project.name || '',
        // 允許修改建立日期，方便補記以前的旅程
        date: project.created_at ? dayjs(project.created_at).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      });
    }
  }, [isOpen, project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !formData.name.trim()) return;
    setLoading(true);

    try {
      // ★ 簡化邏輯：只更新 projects 資料表，完全不動成員表
      const { error } = await supabase
        .from('projects')
        .update({ 
          name: formData.name.trim(), 
          created_at: formData.date 
        })
        .eq('id', project.id);

      if (error) throw error;

      message.success('專案資訊已更新');
      onClose();
      onRefresh();
    } catch (err) { 
      console.error(err);
      message.error('儲存失敗'); 
    } finally { 
      setLoading(false); 
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`drawer-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="drawer-container" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
        <div className="sheet-indicator" style={{ margin: '0 auto 20px' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>編輯專案資訊</h3>
          <button onClick={onClose} className="hamburger-btn"><X size={24}/></button>
        </div>

        {/* 專案標題大字輸入框 */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <input 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            placeholder="專案名稱"
            style={{ 
              background: 'transparent', border: 'none', fontSize: '32px', 
              fontWeight: '900', color: 'var(--color-primary)', width: '100%', 
              textAlign: 'center', outline: 'none'
            }} 
          />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* 日期選擇器 */}
          <div>
            <label style={{ display: 'block', color: '#666', fontSize: '13px', fontWeight: '600', marginBottom: '8px', paddingLeft: '4px' }}>
              專案日期
            </label>
            <ResponsiveDatePicker 
              value={dayjs(formData.date)} 
              onChange={(val) => setFormData({...formData, date: val.format('YYYY-MM-DD')})}
            />
          </div>

          <button type="submit" className="band-btn-main" style={{ width: '100%' }} disabled={loading}>
            {loading ? '儲存中...' : '確認儲存'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;