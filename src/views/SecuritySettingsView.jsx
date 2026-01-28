import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, Lock, User, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';
import ConfirmModal from '../components/ConfirmModal';

const SecuritySettingsView = ({ onBack, user }) => {
  const [loading, setLoading] = useState(false);
  
  // 名稱修改狀態
  const [displayName, setDisplayName] = useState('');
  
  // 密碼修改狀態
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 刪除帳號彈窗
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 初始化：讀取目前的使用者名稱
  useEffect(() => {
    if (user && user.user_metadata) {
      setDisplayName(user.user_metadata.name || '');
    }
  }, [user]);

  // 1. 修改顯示名稱
  const handleUpdateName = async () => {
    if (!displayName.trim()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: displayName }
      });

      if (error) throw error;
      message.success('名稱已更新');
      window.location.reload(); 
    } catch (err) {
      message.error('更新失敗：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. 修改密碼
  const handleUpdatePassword = async () => {
    if (!password || !confirmPassword) {
      message.error('請輸入新密碼');
      return;
    }
    if (password !== confirmPassword) {
      message.error('兩次密碼輸入不一致');
      return;
    }
    if (password.length < 6) {
      message.error('密碼長度需大於 6 碼');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      message.success('密碼已變更，下次登入請使用新密碼');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      message.error('變更失敗：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. 刪除帳號
  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.rpc('delete_user');
      
      if (error) throw error;
      
      message.success('帳號已刪除，後會有期');
      await supabase.auth.signOut();
      window.location.href = '/'; 
      
    } catch (err) {
      console.error(err);
      message.error('刪除失敗，請稍後再試');
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    // ★ 修正處：移除 .app-main-layout，改用 Flex Column 填滿父容器
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      
      {/* Header：固定在頂部 */}
      <header className="navbar" style={{ flexShrink: 0, backgroundColor: 'var(--color-bg-main)', position: 'relative', zIndex: 10 }}>
        <button onClick={onBack} className="hamburger-btn">
          <ChevronLeft size={24} color="var(--color-text-main)"/>
        </button>
        <span className="nav-brand" style={{ fontSize: '18px', fontWeight: '800' }}>帳號安全性</span>
        <div style={{ width: 44 }}></div>
      </header>

      {/* Content：自適應高度並啟用捲軸 */}
      <main className="band-container" style={{ flex: 1, overflowY: 'auto', paddingBottom: '40px', paddingTop: '24px' }}>
        
        {/* 區塊 1: 基本資料 */}
        <div className="band-card" style={{ padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '16px' }}>
            <User size={20} color="var(--color-primary)" />
            <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>顯示名稱</h3>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="輸入你的暱稱"
              style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', background: '#222', border: '1px solid #444', color: '#fff', outline: 'none' }}
            />
            <button 
              onClick={handleUpdateName}
              disabled={loading}
              style={{ 
                padding: '0 20px', borderRadius: '12px', 
                background: 'var(--color-primary)', border: 'none', 
                color: '#fff', fontWeight: 'bold', cursor: 'pointer',
                opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Save size={18} />
            </button>
          </div>
          <p style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>此名稱將顯示在側邊欄與協作專案中。</p>
        </div>

        {/* 區塊 2: 密碼設定 */}
        <div className="band-card" style={{ padding: '24px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '16px' }}>
            <Lock size={20} color="var(--color-primary)" />
            <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>變更密碼</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '6px' }}>新密碼</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="輸入新密碼"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: '#222', border: '1px solid #444', color: '#fff', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '6px' }}>確認新密碼</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次輸入新密碼"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: '#222', border: '1px solid #444', color: '#fff', outline: 'none' }}
              />
            </div>

            <button 
              onClick={handleUpdatePassword}
              disabled={loading}
              className="band-btn-main"
              style={{ marginTop: '8px', padding: '12px' }}
            >
              更新密碼
            </button>
          </div>
        </div>

        {/* 區塊 3: 危險區域 */}
        <div className="band-card" style={{ padding: '24px', border: '1px solid rgba(255, 107, 107, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <AlertTriangle size={20} color="#ff6b6b" />
            <h3 style={{ margin: 0, color: '#ff6b6b', fontSize: '18px' }}>危險區域</h3>
          </div>
          
          <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
            刪除帳號後，您的所有個人資料將被永久移除，且無法復原。
          </p>

          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            style={{ 
              width: '100%', padding: '14px', borderRadius: '12px', 
              background: 'rgba(255, 107, 107, 0.1)', border: '1px solid #ff6b6b', 
              color: '#ff6b6b', fontWeight: 'bold', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <Trash2 size={18} /> 刪除我的帳號
          </button>
        </div>

      </main>

      {/* 刪除確認彈窗 */}
      <ConfirmModal 
        open={isDeleteModalOpen}
        title="確定要刪除帳號？"
        content="此動作將永久刪除您的帳號與資料，無法復原。確定要繼續嗎？"
        onConfirm={handleDeleteAccount}
        onCancel={() => setIsDeleteModalOpen(false)}
        loading={loading}
      />
    </div>
  );
};

export default SecuritySettingsView;