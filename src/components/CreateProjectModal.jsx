import React, { useState, useEffect } from 'react';
import { X, Layout, Users, FileText, Check } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const CreateProjectModal = ({ isOpen, onClose, onCreate, user }) => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [personnelList, setPersonnelList] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);

  useEffect(() => {
    if (isOpen && user?.id) {
      const fetchPersonnel = async () => {
        const { data } = await supabase.from('personnel').select('*').eq('user_id', user.id);
        if (data) setPersonnelList(data);
      };
      fetchPersonnel();
    }
  }, [isOpen, user?.id]);

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay active`} onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-indicator"></div>

        {/* 1. 標題與關閉按鈕對齊 */}
        <div className="sheet-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-text-main)', margin: 0 }}>
            建立新分帳專案
          </h3>
          <button onClick={onClose} className="hamburger-btn" style={{ background: 'var(--color-bg)', borderRadius: '50%', padding: '4px' }}>
            <X size={24} color="var(--color-text-main)"/>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onCreate({...formData, memberIds: selectedMemberIds}); onClose(); }}>
          
          {/* 2. 專案名稱：Icon 內置化 */}
          <div className="input-wrapper">
            <Layout size={18} className="input-icon" />
            <input 
              type="text" 
              placeholder="專案名稱 (例如：虎小島台中專場)" 
              className="band-input"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          {/* 3. 人員選擇：藥丸化排列 */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Users size={18} color="var(--color-text-main)" />
              <span style={{ fontSize: '15px', color: 'var(--color-text-main)', fontWeight: '500' }}>選擇專案人員</span>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {personnelList.length > 0 ? (
                personnelList.map(p => (
                  <div 
                    key={p.id} 
                    className={`person-pill-card ${selectedMemberIds.includes(p.id) ? 'active' : ''}`}
                    onClick={() => setSelectedMemberIds(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                    style={{ 
                      padding: '8px 16px', marginBottom: 0,
                      border: selectedMemberIds.includes(p.id) ? '1.5px solid var(--color-primary)' : '1px solid transparent'
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{p.name}</span>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--color-text-sub)', fontSize: '13px', padding: '10px 0' }}>
                  尚未建立常用名單，請至系統設定中新增。
                </div>
              )}
            </div>
          </div>

          {/* 4. 備註區塊 */}
          <div className="input-wrapper">
            <FileText size={18} className="input-icon" style={{ top: '25px' }} />
            <textarea 
              placeholder="備註 (選填)" 
              className="band-input"
              style={{ height: '100px', borderRadius: '20px', paddingTop: '15px', paddingLeft: '50px' }}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* 按鈕文字寫死白色 */}
          <button type="submit" className="band-btn-primary">
            確認建立專案
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;