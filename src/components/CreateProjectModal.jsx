import React, { useState, useEffect } from 'react';
import { X, Layout, Users, FileText } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';
import MemberSelect from './MemberSelect';

const CreateProjectModal = ({ isOpen, onClose, user, personnel = [], onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [internalUser, setInternalUser] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const u = user?.id ? user : user?.user;
      if (u) setInternalUser(u);
    }
  }, [isOpen, user]);

  const personnelOptions = (personnel || []).map(p => ({ label: p.name, value: p.id }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!internalUser?.id || loading) return;
    setLoading(true);
    try {
      const { data: project, error: pError } = await supabase.from('projects').insert([{ 
        name: formData.name.trim(), description: formData.description.trim(), user_id: internalUser.id 
      }]).select().single();
      if (pError) throw pError;

      if (selectedMemberIds.length > 0) {
        const payload = selectedMemberIds.map(mid => ({ 
          project_id: project.id, personnel_id: mid, user_id: internalUser.id 
        }));
        await supabase.from('project_members').insert(payload);
      }
      message.success('專案建立成功');
      setFormData({ name: '', description: '' }); setSelectedMemberIds([]);
      onClose(); if (onRefresh) onRefresh();
    } catch (err) { message.error(err.message); } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    // 調用地基 .drawer-overlay 與 .active
    <div className={`drawer-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      
      {/* 調用地基 .drawer-container */}
      <div className="drawer-container" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
        
        {/* 檔案補足：抽屜把手 */}
        <div style={{ width: '40px', height: '5px', background: '#333', borderRadius: '10px', margin: '0 auto 24px' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#fff' }}>建立新分帳專案</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
            <X size={24}/>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 補足細節：專案名稱 */}
          <div style={{ marginBottom: '24px' }}>
            <SectionLabel icon={<Layout size={18}/>} text="專案名稱" />
            <input 
              type="text" className="band-input-pill" placeholder="例如：虎小島一月分帳" 
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
              style={{ width: '100%' }} required 
            />
          </div>

          {/* 補足細節：人員選擇 */}
          <div style={{ marginBottom: '24px' }}>
            <SectionLabel icon={<Users size={18}/>} text="選擇專案人員" />
            <MemberSelect options={personnelOptions} value={selectedMemberIds} onChange={setSelectedMemberIds} />
          </div>

          {/* 補足細節：備註 */}
          <div style={{ marginBottom: '32px' }}>
            <SectionLabel icon={<FileText size={18}/>} text="備註 (選填)" />
            <textarea 
              className="band-input-pill" 
              style={{ height: '100px', borderRadius: '20px', paddingTop: '15px', resize: 'none', width: '100%' }}
              value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* 調用地基 .band-btn-main */}
          <button type="submit" className="band-btn-main" style={{ width: '100%' }} disabled={loading}>
            {loading ? '正在建立...' : '確認建立專案'}
          </button>
        </form>
      </div>
    </div>
  );
};

// 檔案內補足：帶 Icon 的標籤
const SectionLabel = ({ icon, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
    <span style={{ color: 'var(--color-primary)' }}>{icon}</span>
    <span style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>{text}</span>
  </div>
);

export default CreateProjectModal;