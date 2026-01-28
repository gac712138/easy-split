import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';
import { Mail, Lock, User, ArrowRight, ChevronLeft, KeyRound } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

// 定義視圖狀態
const MODE = {
  LOGIN: 'LOGIN',
  
  // 註冊流程
  REG_EMAIL: 'REG_EMAIL',
  REG_OTP: 'REG_OTP',
  REG_SETUP: 'REG_SETUP',

  // 忘記密碼流程
  FORGOT_EMAIL: 'FORGOT_EMAIL',
  FORGOT_OTP: 'FORGOT_OTP',
  FORGOT_RESET: 'FORGOT_RESET'
};

const AuthView = () => {
  const [mode, setMode] = useState(MODE.LOGIN);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // 表單資料
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');

  // --- 1. 一般登入邏輯 ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingText('驗證身分中...');
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // 登入成功，App.js 會自動切換畫面
    } catch (error) {
      message.error('登入失敗：' + error.message);
      setLoading(false);
    }
  };

  // --- 2. 發送 OTP (註冊 & 忘記密碼共用) ---
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
      
      message.success('驗證碼已寄出，請檢查信箱');
      setMode(nextMode); // 切換到輸入 OTP 畫面
    } catch (error) {
      message.error('發送失敗：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. 驗證 OTP (註冊 & 忘記密碼共用) ---
  const handleVerifyOtp = async (nextMode) => {
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

      // 驗證成功後，其實使用者已經登入 (Session Active)
      // 但我們還不讓 App.js 抓到 user (因為資料還沒設定好)
      // 這裡利用 UI 狀態擋住，直到 Setup 完成
      setMode(nextMode); 
    } catch (error) {
      message.error('驗證碼錯誤或過期');
    } finally {
      setLoading(false);
    }
  };

  // --- 4. 註冊最後一步：初始化資料 ---
  const handleRegisterSetup = async () => {
    if (!name.trim() || !password) return;
    setLoading(true);
    setLoadingText('建立帳號資料...');
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
        data: { name: name }
      });
      if (error) throw error;
      
      message.success('註冊成功！歡迎加入');
      // 這裡不用做什麼，因為已經登入且資料更新，App.js 會自動重繪
      window.location.reload(); // 簡單暴力重整以確保狀態同步
    } catch (error) {
      message.error('設定失敗：' + error.message);
      setLoading(false);
    }
  };

  // --- 5. 忘記密碼最後一步：重設密碼 ---
  const handlePasswordReset = async () => {
    if (!password) return;
    setLoading(true);
    setLoadingText('更新密碼...');
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      if (error) throw error;

      message.success('密碼重設成功');
      window.location.reload();
    } catch (error) {
      message.error('重設失敗：' + error.message);
      setLoading(false);
    }
  };


  // --- UI 元件：輸入框樣式封裝 ---
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

  return (
    <div style={{ 
      height: '100vh', display: 'flex', flexDirection: 'column', 
      alignItems: 'center', justifyContent: 'center', padding: '24px',
      background: 'var(--color-bg-main)'
    }}>
      
      {/* 全螢幕讀取動畫 */}
      {loading && <LoadingScreen text={loadingText} />}

      <div style={{ width: '100%', maxWidth: '400px' }}>
        
        {/* Logo 區塊 */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '24px', 
            background: 'var(--color-primary)', margin: '0 auto 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px', fontWeight: '900', color: '#fff',
            boxShadow: '0 0 40px rgba(255, 215, 0, 0.2)'
          }}>
            E
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>
            EasySplit
          </h1>
          <p style={{ color: '#888', fontSize: '16px' }}>
            {mode === MODE.LOGIN && '歡迎回來，請登入'}
            {mode.startsWith('REG') && '註冊新帳號'}
            {mode.startsWith('FORGOT') && '重設密碼'}
          </p>
        </div>

        {/* --- 1. 登入主畫面 --- */}
        {mode === MODE.LOGIN && (
          <form onSubmit={handleLogin}>
            <InputField icon={Mail} type="email" placeholder="Email" value={email} onChange={setEmail} />
            <InputField icon={Lock} type="password" placeholder="密碼" value={password} onChange={setPassword} />
            
            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <button type="button" onClick={() => setMode(MODE.FORGOT_EMAIL)} style={{ background: 'none', border: 'none', color: '#666', fontSize: '13px', cursor: 'pointer' }}>
                忘記密碼？
              </button>
            </div>

            <button type="submit" className="band-btn-main" style={{ width: '100%', padding: '16px', fontSize: '16px' }}>
              登入
            </button>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <span style={{ color: '#666' }}>還沒有帳號？</span>
              <button type="button" onClick={() => setMode(MODE.REG_EMAIL)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 'bold', marginLeft: '8px', cursor: 'pointer' }}>
                立即註冊
              </button>
            </div>
          </form>
        )}

        {/* --- 2. 輸入 Email (註冊 & 忘記密碼共用) --- */}
        {(mode === MODE.REG_EMAIL || mode === MODE.FORGOT_EMAIL) && (
          <div>
             <button onClick={() => setMode(MODE.LOGIN)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#888', marginBottom: '20px', cursor: 'pointer' }}>
              <ChevronLeft size={18} /> 返回登入
            </button>
            <InputField icon={Mail} type="email" placeholder="請輸入 Email" value={email} onChange={setEmail} autoFocus />
            <button 
              onClick={() => handleSendOtp(mode === MODE.REG_EMAIL ? MODE.REG_OTP : MODE.FORGOT_OTP)} 
              className="band-btn-main" 
              style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: '16px' }}
            >
              發送驗證碼 <ArrowRight size={18} style={{ marginLeft: '8px', verticalAlign: 'middle' }}/>
            </button>
          </div>
        )}

        {/* --- 3. 輸入 OTP (註冊 & 忘記密碼共用) --- */}
        {(mode === MODE.REG_OTP || mode === MODE.FORGOT_OTP) && (
          <div>
            <button onClick={() => setMode(mode === MODE.REG_OTP ? MODE.REG_EMAIL : MODE.FORGOT_EMAIL)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#888', marginBottom: '20px', cursor: 'pointer' }}>
              <ChevronLeft size={18} /> 返回上一步
            </button>
            <div style={{ marginBottom: '16px', color: '#ccc', fontSize: '14px' }}>
              驗證碼已發送至 <span style={{ color: 'var(--color-primary)' }}>{email}</span>
            </div>
            <InputField icon={KeyRound} type="text" placeholder="輸入 6 位數驗證碼" value={otp} onChange={setOtp} autoFocus />
            <button 
              onClick={() => handleVerifyOtp(mode === MODE.REG_OTP ? MODE.REG_SETUP : MODE.FORGOT_RESET)} 
              className="band-btn-main" 
              style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: '16px' }}
            >
              驗證並繼續
            </button>
          </div>
        )}

        {/* --- 4. 註冊資料設定 --- */}
        {mode === MODE.REG_SETUP && (
          <div>
             <div style={{ marginBottom: '24px', color: '#888', fontSize: '14px', textAlign: 'center' }}>
              驗證成功！請設定您的帳號資料
            </div>
            <InputField icon={User} type="text" placeholder="您的姓名 / 暱稱" value={name} onChange={setName} autoFocus />
            <InputField icon={Lock} type="password" placeholder="設定登入密碼" value={password} onChange={setPassword} />
            
            <button 
              onClick={handleRegisterSetup} 
              className="band-btn-main" 
              style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: '16px' }}
            >
              完成註冊，進入 Dashboard
            </button>
          </div>
        )}

        {/* --- 5. 重設密碼 --- */}
        {mode === MODE.FORGOT_RESET && (
          <div>
             <div style={{ marginBottom: '24px', color: '#888', fontSize: '14px', textAlign: 'center' }}>
              驗證成功！請設定新密碼
            </div>
            <InputField icon={Lock} type="password" placeholder="輸入新密碼" value={password} onChange={setPassword} autoFocus />
            
            <button 
              onClick={handlePasswordReset} 
              className="band-btn-main" 
              style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: '16px' }}
            >
              更新密碼並登入
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthView;
