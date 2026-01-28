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
  // REG_SETUP 拿掉，因為我們會改用 App.js 的 Modal 來處理
  FORGOT_EMAIL: 'FORGOT_EMAIL',
  FORGOT_OTP: 'FORGOT_OTP',
  FORGOT_RESET: 'FORGOT_RESET'
};

// ★ 關鍵修正：把 InputField 搬到主組件外面，這樣 React 才會認定它是同一個組件
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
        background: '#222', border: '1px solid #333', borderRadius: '14px',
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

  // 表單資料
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  // 1. 一般登入
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

  // 2. 發送 OTP
  const handleSendOtp = async (nextMode) => {
    if (!email.includes('@')) {
      message.error('請輸入有效的 Email');
      return;
    }
    setLoading(true);
    setLoadingText('發送驗證碼...');
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      message.success('驗證碼已寄出');
      setMode(nextMode);
    } catch (error) {
      message.error('發送失敗：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. 驗證 OTP
  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      message.error('請輸入 6 位數驗證碼');
      return;
    }
    setLoading(true);
    setLoadingText('驗證中...');
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (error) throw error;
      // 驗證成功後，Supabase 會自動更新 Session
      // App.js 會偵測到 user 登入，並自動切換畫面
      // 所以這裡不需要做任何導向，只要確保不報錯即可
    } catch (error) {
      message.error('驗證碼錯誤或過期');
      setLoading(false);
    }
  };

  // 4. 重設密碼 (忘記密碼流程用)
  const handlePasswordReset = async () => {
    if (!password) return;
    setLoading(true);
    setLoadingText('更新密碼...');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      message.success('密碼重設成功');
      window.location.reload();
    } catch (error) {
      message.error('重設失敗：' + error.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--color-bg-main)' }}>
      {loading && <LoadingScreen text={loadingText} />}

      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--color-primary)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: '900', color: '#fff', boxShadow: '0 0 40px rgba(255, 215, 0, 0.2)' }}>E</div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>EasySplit</h1>
          <p style={{ color: '#888', fontSize: '16px' }}>
            {mode === MODE.LOGIN ? '歡迎回來，請登入' : (mode.startsWith('REG') ? '註冊新帳號' : '重設密碼')}
          </p>
        </div>

        {/* 登入 */}
        {mode === MODE.LOGIN && (
          <form onSubmit={handleLogin}>
            <InputField icon={Mail} type="email" placeholder="Email" value={email} onChange={setEmail} />
            <InputField icon={Lock} type="password" placeholder="密碼" value={password} onChange={setPassword} />
            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <button type="button" onClick={() => setMode(MODE.FORGOT_EMAIL)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '13px', cursor: 'pointer' }}>忘記密碼？</button>
            </div>
            <button type="submit" className="band-btn-main" style={{ width: '100%', padding: '16px', fontSize: '16px' }}>登入</button>
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <span style={{ color: '#666' }}>還沒有帳號？</span>
              <button type="button" onClick={() => setMode(MODE.REG_EMAIL)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 'bold', marginLeft: '8px', cursor: 'pointer' }}>立即註冊</button>
            </div>
          </form>
        )}

        {/* 輸入 Email */}
        {(mode === MODE.REG_EMAIL || mode === MODE.FORGOT_EMAIL) && (
          <div>
            <button onClick={() => setMode(MODE.LOGIN)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#888', marginBottom: '20px', cursor: 'pointer' }}><ChevronLeft size={18} /> 返回登入</button>
            <InputField icon={Mail} type="email" placeholder="請輸入 Email" value={email} onChange={setEmail} autoFocus />
            <button onClick={() => handleSendOtp(mode === MODE.REG_EMAIL ? MODE.REG_OTP : MODE.FORGOT_OTP)} className="band-btn-main" style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: '16px' }}>發送驗證碼 <ArrowRight size={18} style={{ marginLeft: '8px', verticalAlign: 'middle' }}/></button>
          </div>
        )}

        {/* 輸入 OTP */}
        {(mode === MODE.REG_OTP || mode === MODE.FORGOT_OTP) && (
          <div>
            <button onClick={() => setMode(mode === MODE.REG_OTP ? MODE.REG_EMAIL : MODE.FORGOT_EMAIL)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#888', marginBottom: '20px', cursor: 'pointer' }}><ChevronLeft size={18} /> 返回上一步</button>
            <div style={{ marginBottom: '16px', color: '#ccc', fontSize: '14px' }}>驗證碼已發送至 <span style={{ color: 'var(--color-primary)' }}>{email}</span></div>
            <InputField icon={KeyRound} type="text" placeholder="輸入 6 位數驗證碼" value={otp} onChange={setOtp} autoFocus />
            {/* 如果是註冊，驗證後什麼都不做(等App.js處理)，如果是忘記密碼，驗證後去重設 */}
            <button onClick={() => handleVerifyOtp()} className="band-btn-main" style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: '16px' }}>驗證並登入</button>
          </div>
        )}

        {/* 重設密碼 (只給忘記密碼用) */}
        {mode === MODE.FORGOT_RESET && (
          <div>
            <div style={{ marginBottom: '24px', color: '#888', fontSize: '14px', textAlign: 'center' }}>驗證成功！請設定新密碼</div>
            <InputField icon={Lock} type="password" placeholder="輸入新密碼" value={password} onChange={setPassword} autoFocus />
            <button onClick={handlePasswordReset} className="band-btn-main" style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: '16px' }}>更新密碼並登入</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthView;