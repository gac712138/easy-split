import React, { useState } from 'react';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const AuthForm = ({ isSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 核心功能：處理登入與註冊
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      if (isSignUp) alert('請檢查 Email 驗證信！');
    } catch (err) { 
      alert(err.message === 'Invalid login credentials' ? '帳號或密碼錯誤' : err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <form onSubmit={handleAuth} style={{ width: '100%' }}>
      <div className="input-wrapper">
        <Mail size={18} className="input-icon" />
        <input
          type="email"
          placeholder="Email"
          className="band-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="input-wrapper">
        <Lock size={18} className="input-icon" />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="密碼"
          className="band-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button 
          type="button" 
          className="password-toggle"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <button type="submit" className="band-btn-primary" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? '立即加入' : '登入')}
      </button>
    </form>
  );
};

export default AuthForm;