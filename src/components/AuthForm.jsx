import React, { useState } from 'react';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { message } from 'antd';

const AuthForm = ({ isSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      if (isSignUp) message.success('請檢查 Email 驗證信！');
    } catch (err) { 
      message.error(err.message === 'Invalid login credentials' ? '帳號或密碼錯誤' : err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <form onSubmit={handleAuth} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Email 輸入框：套用 Pill 地基 */}
      <div className="input-pill-wrapper" style={{ position: 'relative', width: '100%' }}>
        <Mail 
          size={18} 
          style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-sub)' }} 
        />
        <input
          type="email"
          placeholder="電子郵件地址"
          className="band-input-pill"
          style={{ width: '100%', paddingLeft: '52px' }} // 為左側 Icon 留空間
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* 2. 密碼輸入框：套用 Pill 地基 */}
      <div className="input-pill-wrapper" style={{ position: 'relative', width: '100%' }}>
        <Lock 
          size={18} 
          style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-sub)' }} 
        />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="請輸入密碼"
          className="band-input-pill"
          style={{ width: '100%', paddingLeft: '52px', paddingRight: '52px' }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button 
          type="button" 
          onClick={() => setShowPassword(!showPassword)}
          style={{ 
            position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', color: 'var(--color-text-sub)', cursor: 'pointer',
            display: 'flex', alignItems: 'center'
          }}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* 3. 提交按鈕：對齊旗艦主按鈕 */}
      <button 
        type="submit" 
        className="band-btn-main" 
        disabled={loading}
        style={{ width: '100%', marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? '立即EasySplit' : '登入系統')}
      </button>
    </form>
  );
};

export default AuthForm;