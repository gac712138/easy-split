import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';
import { Mail, Lock, ArrowRight, ChevronLeft, KeyRound } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

// 定義視圖狀態
const MODE = {
  LOGIN: 'LOGIN',
  REG_EMAIL: 'REG_EMAIL',
  REG_OTP: 'REG_OTP',
  FORGOT_EMAIL: 'FORGOT_EMAIL',
  FORGOT_OTP: 'FORGOT_OTP',
  FORGOT_RESET: 'FORGOT_RESET'
};

// 優化後的輸入框組件
const InputField = ({ icon: Icon, type, placeholder, value, onChange, autoFocus }) => (
  <div style={{ position: 'relative', marginBottom: '16px' }}>
    <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#666', pointerEvents: 'none' }}>
      <Icon size={20} />
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoFocus={autoFocus}
      style={{
        width: '100%',
        padding: '14px 16px 14px 50px', // 調整內距讓文字不撞 icon
        height: '52px', // 增加高度提升點擊手感
        background: 'rgba(255, 255, 255, 0.05)', // 半透明背景
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px', // 更圓潤的導角
        color: '#fff',
        fontSize: '15px',
        outline: 'none',
        transition: 'all 0.2s ease',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
      }}
      onFocus={(e) => {
        e.target.style.borderColor = 'var(--color-primary)';
        e.target.style.background = 'rgba(255, 255, 255, 0.08)';
        e.target.style.boxShadow = '0 0 0 4px rgba(var(--color-primary-rgb), 0.1)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
        e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)';
      }}
    />
  </div>
);

// 主按鈕樣式 (共用)
const mainBtnStyle = {
  width: '100%',
  height: '52px',
  borderRadius: '26px', // 完全圓角
  border: 'none',
  background: 'linear-gradient(135deg, var(--color-primary) 0%, #2563eb 100%)', // 加上微弱漸層
  color: '#fff',
  fontSize: '16px',
  fontWeight: '700',
  cursor: 'pointer',
  transition: 'transform 0.1s, box-shadow 0.2s',
  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)', // 藍色光暈
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '12px'
};

const AuthView = ({ onOAuthLogin }) => {
  const [mode, setMode] = useState(MODE.LOGIN);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  // ... (這裡保留原本的 handleLogin, handleSendOtp, handleVerifyOtp, handlePasswordReset 邏輯，完全不變) ...
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingText('驗證身分中...');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      message.error('登入失敗：' + error.message);
      setLoading(false);
    }
  };

  const handleSendOtp = async (nextMode) => {
    if (!email.includes('@')) { message.error('請輸入有效的 Email'); return; }
    setLoading(true);
    setLoadingText('發送驗證碼...');
    try {
      if (mode === MODE.REG_EMAIL) {
        const { data: existingUser, error: checkError } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
        if (checkError) throw checkError;
        if (existingUser) {
          message.warning('此帳戶已註冊，請直接登入');
          setMode(MODE.LOGIN); setLoading(false); return; 
        }
      }
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: mode === MODE.REG_EMAIL } });
      if (error) throw error;
      message.success('驗證碼已寄出');
      setMode(nextMode);
    } catch (error) { message.error('發送失敗：' + error.message); } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) { message.error('請輸入 6 位數驗證碼'); return; }
    setLoading(true);
    setLoadingText('驗證中...');
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (error) throw error;
    } catch (error) { message.error('驗證碼錯誤或過期'); setLoading(false); }
  };

  const handlePasswordReset = async () => {
    if (!password) return;
    setLoading(true);
    setLoadingText('更新密碼...');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      message.success('密碼重設成功'); window.location.reload();
    } catch (error) { message.error('重設失敗：' + error.message); setLoading(false); }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'radial-gradient(circle at top right, #1f1f1f, #121212)' }}>
      {loading && <LoadingScreen text={loadingText} />}

      <div style={{ width: '100%', maxWidth: '380px' }}>
        
        {/* Logo 區域 */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '120px', height: '120px', margin: '0 auto 24px', 
            borderRadius: '24px', overflow: 'hidden', 
            boxShadow: '0 12px 24px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' 
          }}>
            <img src="/og-image.png" alt="EasySplit Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '8px', letterSpacing: '0.5px' }}>
            EasySplit
          </h2>
          <p style={{ color: '#888', fontSize: '14px', fontWeight: '500' }}>
            {mode === MODE.LOGIN ? '歡迎回來，請登入您的帳戶' : (mode.startsWith('REG') ? '建立您的 EasySplit 帳號' : '重設您的密碼')}
          </p>
        </div>

        {mode === MODE.LOGIN && (
          <form onSubmit={handleLogin}>
            <InputField icon={Mail} type="email" placeholder="電子信箱" value={email} onChange={setEmail} />
            <InputField icon={Lock} type="password" placeholder="密碼" value={password} onChange={setPassword} />
            
            <div style={{ textAlign: 'right', marginBottom: '24px', marginTop: '-8px' }}>
              <button type="button" onClick={() => setMode(MODE.FORGOT_EMAIL)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '13px', cursor: 'pointer', fontWeight: '500', transition: 'color 0.2s' }} onMouseEnter={(e)=>e.target.style.color='#fff'} onMouseLeave={(e)=>e.target.style.color='#888'}>
                忘記密碼？
              </button>
            </div>
            
            {/* 登入按鈕 */}
            <button 
              type="submit" 
              style={mainBtnStyle}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              登入
            </button>
            
            {/* ★ 優化後的分隔線 */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '28px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2))' }}></div>
              <span style={{ padding: '0 12px', fontSize: '13px', color: '#666', fontWeight: '500' }}>或</span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.2), transparent)' }}></div>
            </div>

            {/* ★ 優化後的 Google 按鈕 */}
            <button 
              type="button" 
              onClick={() => onOAuthLogin('google')}
              style={{
                width: '100%',
                height: '52px',
                borderRadius: '26px', // 與主按鈕一致的圓角
                border: 'none',
                background: '#eef0f3ff', // 柔和的灰白，不像純白那麼刺眼
                color: '#1f1f1f',
                fontSize: '15px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '12px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#ffffff'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f8f9fa'}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img src="/GoogleLogo.png" alt="Google" width="35" height="35" />
              使用 Google 帳號繼續
            </button>

            {/* ★ LINE 登入按鈕 */}
            <button 
              type="button" 
              onClick={() => onOAuthLogin('line')}
              style={{
                width: '100%',
                height: '52px',
                borderRadius: '26px',
                border: 'none',
                background: '#06C755',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(6, 199, 85, 0.3)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#05B34A'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#06C755'}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img 
                src="/LineLogo.png" 
                alt="LINE" 
                width="40" 
                height="40"
                style={{ 
                  marginRight: '12px',
                  objectFit: 'contain'
                }}
              />
              使用 LINE 帳號繼續
            </button>

            <div style={{ marginTop: '32px', textAlign: 'center' }}>
              <span style={{ color: '#666', fontSize: '14px' }}>還沒有帳號？</span>
              <button type="button" onClick={() => setMode(MODE.REG_EMAIL)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '700', marginLeft: '6px', cursor: 'pointer', fontSize: '14px' }}>立即註冊</button>
            </div>
          </form>
        )}

        {/* 註冊與忘記密碼區域 (保持按鈕風格一致) */}
        {(mode === MODE.REG_EMAIL || mode === MODE.FORGOT_EMAIL) && (
          <div>
            <button onClick={() => setMode(MODE.LOGIN)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#888', marginBottom: '24px', cursor: 'pointer', fontWeight: '500' }}><ChevronLeft size={18} /> 返回登入</button>
            <InputField icon={Mail} type="email" placeholder="請輸入 Email" value={email} onChange={setEmail} autoFocus />
            <button onClick={() => handleSendOtp(mode === MODE.REG_EMAIL ? MODE.REG_OTP : MODE.FORGOT_OTP)} style={mainBtnStyle}>
              發送驗證碼 <ArrowRight size={18} style={{ marginLeft: '8px' }}/>
            </button>
          </div>
        )}

        {(mode === MODE.REG_OTP || mode === MODE.FORGOT_OTP) && (
          <div>
            <button onClick={() => setMode(mode === MODE.REG_OTP ? MODE.REG_EMAIL : MODE.FORGOT_EMAIL)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#888', marginBottom: '24px', cursor: 'pointer', fontWeight: '500' }}><ChevronLeft size={18} /> 返回上一步</button>
            <div style={{ marginBottom: '20px', color: '#aaa', fontSize: '14px', lineHeight: '1.5' }}>我們已將 6 位數驗證碼發送至 <br/><span style={{ color: '#fff', fontWeight: '600' }}>{email}</span></div>
            <InputField icon={KeyRound} type="text" placeholder="輸入 6 位數驗證碼" value={otp} onChange={setOtp} autoFocus />
            <button onClick={() => handleVerifyOtp()} style={mainBtnStyle}>驗證並登入</button>
          </div>
        )}

        {mode === MODE.FORGOT_RESET && (
          <div>
            <div style={{ marginBottom: '24px', color: '#4ade80', fontSize: '15px', textAlign: 'center', fontWeight: '600' }}>驗證成功！請設定新密碼</div>
            <InputField icon={Lock} type="password" placeholder="輸入新密碼" value={password} onChange={setPassword} autoFocus />
            <button onClick={handlePasswordReset} style={mainBtnStyle}>更新密碼並登入</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthView;