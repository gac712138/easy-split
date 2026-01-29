import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react'; // 使用 FolderPlus 圖示
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';

const CreateProjectModal = ({ isOpen, onClose, user, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectName.trim() || loading) return;

    setLoading(true);
    try {
      // 1. 建立專案
      const { data: project, error: projError } = await supabase
        .from('projects')
        .insert([
          { 
            name: projectName.trim(),
            user_id: user.id // 擁有者
          }
        ])
        .select()
        .single();

      if (projError) throw projError;

      // 2. 將自己加入成員名單 (Role: Owner)
      const { error: memberError } = await supabase
        .from('project_members')
        .insert([
          {
            project_id: project.id,
            user_id: user.id,
            role: 'owner'
          }
        ]);

      if (memberError) throw memberError;

      // 3. 在人員名單建立自己 (並完成綁定)
      // 優先使用 Google 登入的名字，如果沒有就用 Email 前綴
      const myName = user.user_metadata?.name || user.email?.split('@')[0] || '我';
      
      const { error: persError } = await supabase
        .from('personnel')
        .insert([
          {
            project_id: project.id,
            name: myName,
            linked_user_id: user.id, // ★ 關鍵：直接綁定
            sort_order: 0
          }
        ]);

      if (persError) throw persError;

      message.success('專案建立成功！');
      setProjectName('');
      onClose();
      onRefresh(); // 刷新 Dashboard

    } catch (err) {
      console.error(err);
      message.error('建立失敗：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`drawer-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div 
        className="drawer-container" 
        onClick={(e) => e.stopPropagation()} 
        style={{ padding: '32px 24px', maxWidth: '400px', margin: 'auto', borderRadius: '24px', height: 'auto' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            width: '64px', height: '64px', 
            background: 'rgba(58, 143, 183, 0.1)', 
            borderRadius: '20px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto 16px',
            color: 'var(--color-primary)'
          }}>
            <FolderPlus size={32} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>建立新專案</h2>
          <p style={{ color: '#888', fontSize: '14px' }}>
            開始一個新的旅程或活動
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ color: '#888', fontSize: '13px', paddingLeft: '4px', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
              專案名稱
            </label>
            <input 
              type="text" 
              placeholder="例如：日本旅遊、12月出遊..." 
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="band-input-pill"
              style={{ width: '100%', fontSize: '16px', fontWeight: '500' }}
              autoFocus
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ 
                flex: 1, padding: '16px', borderRadius: '16px', 
                background: 'transparent', border: '1px solid #333', 
                color: '#888', fontWeight: '700', cursor: 'pointer' 
              }}
            >
              取消
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="band-btn-main"
              style={{ flex: 2 }}
            >
              {loading ? '建立中...' : '確認建立'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;