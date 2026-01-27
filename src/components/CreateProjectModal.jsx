import React, { useState, useEffect } from 'react';
import { X, Layout, Users, FileText } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';
import MemberSelect from './MemberSelect';

/**
 * 修正點：加入 personnel prop 接收 App.jsx 預載的名單
 */
const CreateProjectModal = ({ isOpen, onClose, user, personnel = [], onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [internalUser, setInternalUser] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (user?.id || user?.user?.id) {
        setInternalUser(user?.id ? user : user.user);
      } else {
        supabase.auth.getUser().then(({ data }) => {
          if (data?.user) setInternalUser(data.user);
        });
      }
    }
  }, [isOpen, user]);

  // 1. 物理處理：將人員名單轉化為 Select 可讀的格式
  const personnelOptions = (personnel || []).map(p => ({
    label: p.name,
    value: p.id
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!internalUser?.id || loading) return;
    setLoading(true);

    try {
      const { data: project, error: pError } = await supabase
        .from('projects')
        .insert([{ 
          name: formData.name.trim(), 
          description: formData.description.trim(), 
          user_id: internalUser.id 
        }])
        .select().single();

      if (pError) throw pError;

      if (selectedMemberIds.length > 0) {
        const memberPayload = selectedMemberIds.map(mid => ({
          project_id: project.id,
          personnel_id: mid,      // 對齊你的資料庫欄位
          user_id: internalUser.id 
        }));
        
        const { error: mError } = await supabase
          .from('project_members')
          .insert(memberPayload);

        if (mError) throw mError;
      }

      message.success('專案建立成功');
      setFormData({ name: '', description: '' });
      setSelectedMemberIds([]);
      onClose();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("建立專案失敗:", err);
      message.error('儲存失敗：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" onClick={onClose} style={{ zIndex: 5000 }}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ overflow: 'visible' }}>
        <div className="sheet-indicator"></div>
        <div className="sheet-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-text-main)' }}>建立新分帳專案</h3>
          <button onClick={onClose} className="hamburger-btn">
            <X size={24} color="var(--color-text-main)"/>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 1. 專案名稱 */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Layout size={18} color="var(--color-text-main)" />
              <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text-main)' }}>專案名稱</span>
            </div>
            <input 
              type="text" className="band-input" placeholder="例如：虎小島一月分帳" 
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required 
            />
          </div>

          {/* 2. 人員選擇：修正為接收 options */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Users size={18} color="var(--color-text-main)" />
              <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text-main)' }}>選擇專案人員</span>
            </div>
            {internalUser?.id ? (
              <MemberSelect 
                options={personnelOptions} // 直接傳入處理好的選項
                value={selectedMemberIds} 
                onChange={setSelectedMemberIds} 
              />
            ) : (
              <div className="band-input" style={{ display: 'flex', alignItems: 'center', color: '#666' }}>
                身分同步中...
              </div>
            )}
          </div>

          {/* 3. 備註 (選填) */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <FileText size={18} color="var(--color-text-main)" />
              <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text-main)' }}>備註 (選填)</span>
            </div>
            <textarea 
              className="band-input" style={{ height: '100px', borderRadius: '20px', paddingTop: '15px' }}
              value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button type="submit" className="band-btn-primary" disabled={loading || !internalUser?.id}>
            {loading ? '處理中...' : '確認建立專案'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;