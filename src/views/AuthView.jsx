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


// AuthView.jsx 內部的 handleSendOtp 函式

const handleSendOtp = async (nextMode) => {
  if (!email.includes('@')) { 
    message.error('請輸入有效的 Email'); 
    return; 
  }
  
  setLoading(true);
  setLoadingText('發送驗證碼...');

  try {
    // ★ 1. 鋼鐵防呆攔截：僅在「註冊模式」下檢查是否已存在帳號
    if (mode === MODE.REG_EMAIL) {
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (checkError) throw checkError;

      // 如果帳戶已註冊，直接結束流程，不呼叫下方的發送 API
      if (existingUser) {
        message.warning('此帳戶已註冊，請直接登入');
        setMode(MODE.LOGIN); // 自動幫使用者切換回登入模式
        setLoading(false);
        return; 
      }
    }

    // ★ 2. 只有預檢通過 (或是在忘記密碼模式) 才會執行到這裡
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        // 防止註冊時自動建立帳號（選配，視你的 Supabase 設定而定）
        shouldCreateUser: mode === MODE.REG_EMAIL 
      }
    });

    if (error) throw error;
    
    message.success('驗證碼已寄出');
    setMode(nextMode);
  } catch (error) { 
    message.error('發送失敗：' + error.message); 
  } finally { 
    setLoading(false); 
  }
};


const InputField = ({ icon: Icon, type, placeholder, value, onChange, autoFocus }) => (
  <div style={{ position: 'relative', marginBottom: '16px' }}>
    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666' }}>
      <Icon size={20} />
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoFocus={autoFocus}
      style={{
        width: '100%', padding: '16px 16px 16px 48px',
        background: '#1a1a1a', border: '1px solid #333', borderRadius: '14px',
        color: '#fff', fontSize: '16px', outline: 'none', transition: '0.2s'
      }}
      onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
      onBlur={(e) => e.target.style.borderColor = '#333'}
    />
  </div>
);

const AuthView = () => {
  const [mode, setMode] = useState(MODE.LOGIN);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

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
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      message.success('驗證碼已寄出');
      setMode(nextMode);
    } catch (error) { message.error('發送失敗：' + error.message); }
    finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) { message.error('請輸入 6 位數驗證碼'); return; }
    setLoading(true);
    setLoadingText('驗證中...');
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (error) throw error;
    } catch (error) {
      message.error('驗證碼錯誤或過期');
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!password) return;
    setLoading(true);
    setLoadingText('更新密碼...');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      message.success('密碼重設成功');
      window.location.reload();
    } catch (error) { message.error('重設失敗：' + error.message); setLoading(false); }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--color-bg-main)' }}>
      {loading && <LoadingScreen text={loadingText} />}

      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* ★ Logo 區域優化 */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img 
            src="/og-image.png" 
            alt="EasySplit Logo" 
            style={{ 
              width: '240px', 
              height: '240px', 
              borderRadius: '20px', 
              marginBottom: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)', // 紮實深色陰影
              border: '1px solid #333'
            }} 
          />

          <p style={{ color: '#666', fontSize: '15px', fontWeight: '500' }}>
            {mode === MODE.LOGIN ? '歡迎回來，請登入' : (mode.startsWith('REG') ? '註冊新帳號' : '重設密碼')}
          </p>
        </div>

        {mode === MODE.LOGIN && (
          <form onSubmit={handleLogin}>
            <InputField icon={Mail} type="email" placeholder="Email" value={email} onChange={setEmail} />
            <InputField icon={Lock} type="password" placeholder="密碼" value={password} onChange={setPassword} />
            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <button type="button" onClick={() => setMode(MODE.FORGOT_EMAIL)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>忘記密碼？</button>
            </div>
            {/* ★ 鋼鐵圓柱按鈕 */}
            <button type="submit" className="band-btn-main" style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '50px', fontWeight: '800' }}>登入</button>
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <span style={{ color: '#666666', fontSize: '14px' }}>還沒有帳號？</span>
              <button type="button" onClick={() => setMode(MODE.REG_EMAIL)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '800', marginLeft: '8px', cursor: 'pointer' }}>立即註冊</button>
            </div>
          </form>
        )}

        {(mode === MODE.REG_EMAIL || mode === MODE.FORGOT_EMAIL) && (
          <div>
            <button onClick={() => setMode(MODE.LOGIN)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#888', marginBottom: '20px', cursor: 'pointer', fontWeight: '600' }}><ChevronLeft size={18} /> 返回登入</button>
            <InputField icon={Mail} type="email" placeholder="請輸入 Email" value={email} onChange={setEmail} autoFocus />
            <button onClick={() => handleSendOtp(mode === MODE.REG_EMAIL ? MODE.REG_OTP : MODE.FORGOT_OTP)} className="band-btn-main" style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: '16px', borderRadius: '50px', fontWeight: '800' }}>發送驗證碼 <ArrowRight size={18} style={{ marginLeft: '8px', verticalAlign: 'middle' }}/></button>
          </div>
        )}

        {(mode === MODE.REG_OTP || mode === MODE.FORGOT_OTP) && (
          <div>
            <button onClick={() => setMode(mode === MODE.REG_OTP ? MODE.REG_EMAIL : MODE.FORGOT_EMAIL)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#888', marginBottom: '20px', cursor: 'pointer', fontWeight: '600' }}><ChevronLeft size={18} /> 返回上一步</button>
            <div style={{ marginBottom: '16px', color: '#888', fontSize: '14px' }}>驗證碼已發送至 <span style={{ color: 'var(--color-primary)', fontWeight: '700' }}>{email}</span></div>
            <InputField icon={KeyRound} type="text" placeholder="輸入 6 位數驗證碼" value={otp} onChange={setOtp} autoFocus />
            <button onClick={() => handleVerifyOtp()} className="band-btn-main" style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: '16px', borderRadius: '50px', fontWeight: '800' }}>驗證並登入</button>
          </div>
        )}

        {mode === MODE.FORGOT_RESET && (
          <div>
            <div style={{ marginBottom: '24px', color: '#888', fontSize: '14px', textAlign: 'center' }}>驗證成功！請設定新密碼</div>
            <InputField icon={Lock} type="password" placeholder="輸入新密碼" value={password} onChange={setPassword} autoFocus />
            <button onClick={handlePasswordReset} className="band-btn-main" style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: '16px', borderRadius: '50px', fontWeight: '800' }}>更新密碼並登入</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthView;