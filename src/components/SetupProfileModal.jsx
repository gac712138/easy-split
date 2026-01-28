import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';
import { User, Lock, CheckCircle } from 'lucide-react';

const SetupProfileModal = ({ isOpen, user, onComplete }) => {
  const [loading, setLoading] = useState(false);
  
  // 表單狀態
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // ★ 新增：確認密碼

  const handleSubmit = async () => {
    // 1. 基本檢查
    if (!name.trim()) {
      message.error('請輸入您的暱稱');
      return;
    }
    if (password.length < 6) {
      message.error('密碼長度需至少 6 碼');
      return;
    }

    // ★ 2. 新增：檢查兩次密碼是否一致
    if (password !== confirmPassword) {
      message.error('兩次密碼輸入不一致，請重新確認');
      return;
    }

    setLoading(true);
    try {
      // 3. 更新資料
      const { error } = await supabase.auth.updateUser({
        password: password,
        data: { name: name }
      });

      if (error) throw error;

      message.success('資料設定完成！歡迎加入');
      onComplete(); 
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      message.error('設定失敗：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay active" style={{ zIndex: 9999 }}>
      <div className="drawer-container" style={{ padding: '32px 24px', maxWidth: '400px', margin: 'auto', borderRadius: '24px', height: 'auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
            歡迎加入 EasySplit 👋
          </h2>
          <p style={{ color: '#888', fontSize: '14px' }}>
            初次見面！請設定您的暱稱與登入密碼，以便日後使用。
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* 1. 姓名欄位 */}
          <div>
            <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '6px' }}>您的暱稱</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#666" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="例如：安志"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', background: '#222', border: '1px solid #444', color: '#fff', outline: 'none' }}
              />
            </div>
          </div>

          {/* 2. 設定密碼欄位 */}
          <div>
            <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '6px' }}>設定登入密碼</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#666" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                placeholder="至少 6 碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', background: '#222', border: '1px solid #444', color: '#fff', outline: 'none' }}
              />
            </div>
          </div>

          {/* ★ 3. 確認密碼欄位 */}
          <div>
            <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '6px' }}>再次確認密碼</label>
            <div style={{ position: 'relative' }}>
              {/* 若密碼一致且不為空，顯示綠色勾勾，否則顯示鎖頭 */}
              {password && confirmPassword && password === confirmPassword ? (
                <CheckCircle size={18} color="var(--color-primary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              ) : (
                <Lock size={18} color="#666" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              )}
              
              <input 
                type="password" 
                placeholder="請再次輸入密碼"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ 
                  width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', 
                  background: '#222', 
                  // 加入一點互動：如果兩個密碼不同且已經開始輸入，框線變紅
                  border: confirmPassword && password !== confirmPassword ? '1px solid #ff6b6b' : '1px solid #444', 
                  color: '#fff', outline: 'none', transition: '0.2s'
                }}
              />
            </div>
            {/* 錯誤提示文字 (Optional) */}
            {confirmPassword && password !== confirmPassword && (
              <p style={{ color: '#ff6b6b', fontSize: '12px', marginTop: '4px', paddingLeft: '4px' }}>密碼不一致</p>
            )}
          </div>

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="band-btn-main"
            style={{ marginTop: '16px', padding: '14px', width: '100%' }}
          >
            {loading ? '設定中...' : '開始使用'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SetupProfileModal;