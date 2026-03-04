import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';
import { User, Lock, CheckCircle, Mail } from 'lucide-react';

const SetupProfileModal = ({ isOpen, user, onComplete }) => {
  const [loading, setLoading] = useState(false);
  
  // 表單狀態
  const [name, setName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ★ 關鍵判斷：檢查使用者是否透過 OAuth 登入
  // (OAuth 登入的 app_metadata.provider 會是 'google' 或 'line')
  const isOAuthLogin = ['google', 'line'].includes(user?.app_metadata?.provider);
  const hasEmail = !!user?.email;

  const handleSubmit = async () => {
    // 1. 驗證暱稱 (所有人都要)
    if (!name.trim()) {
      message.error('請輸入您的暱稱');
      return;
    }

    // 2. 驗證 Email (OAuth 登入但沒有 Email 時必填)
    if (!hasEmail && !email.trim()) {
      message.error('請輸入您的 Email');
      return;
    }

    // ★ 3. 驗證密碼 (只有「非」OAuth 登入才需要檢查)
    if (!isOAuthLogin) {
      if (password.length < 6) {
        message.error('密碼長度需至少 6 碼');
        return;
      }
      if (password !== confirmPassword) {
        message.error('兩次密碼輸入不一致');
        return;
      }
    }

    setLoading(true);
    try {
      // 4. 準備要更新的資料
      const updatePayload = {
        data: { name: name } // 更新 metadata 中的 name
      };

      // ★ 如果沒有 Email，則更新 Email
      if (!hasEmail && email.trim()) {
        updatePayload.email = email;
      }

      // ★ 只有 Email 用戶才更新密碼
      if (!isOAuthLogin) {
        updatePayload.password = password;
      }

      const { error } = await supabase.auth.updateUser(updatePayload);

      if (error) throw error;

      message.success('設定完成！歡迎加入');
      onComplete(); // 關閉視窗
      // 這裡不一定要 reload，視你的 App 設計而定，reload 可以確保所有狀態重抓
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
      <div className="drawer-container" style={{ padding: '32px 24px', maxWidth: '400px', margin: 'auto', borderRadius: '24px', height: 'auto', background: '#1a1a1a' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
            歡迎加入 EasySplit 👋
          </h2>
          <p style={{ color: '#888', fontSize: '14px' }}>
            初次見面！請設定您的暱稱{ !isOAuthLogin && '與登入密碼' }，以便日後使用。
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* 1. 姓名欄位 (所有人都要填) */}
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

          {/* 2. Email 欄位 (OAuth 登入但沒有 Email 時顯示) */}
          {!hasEmail && (
            <div>
              <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '6px' }}>Email 地址</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#666" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="email" 
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', background: '#222', border: '1px solid #444', color: '#fff', outline: 'none' }}
                />
              </div>
            </div>
          )}

          {/* ★ 3. 只有「非 OAuth 用戶」才顯示密碼欄位 */}
          {!isOAuthLogin && (
            <>
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

              <div>
                <label style={{ display: 'block', color: '#888', fontSize: '13px', marginBottom: '6px' }}>再次確認密碼</label>
                <div style={{ position: 'relative' }}>
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
                      border: confirmPassword && password !== confirmPassword ? '1px solid #ff6b6b' : '1px solid #444', 
                      color: '#fff', outline: 'none', transition: '0.2s'
                    }}
                  />
                </div>
              </div>
            </>
          )}

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