import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';

const AuthView = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="auth-view-container">
      <div className="auth-content-wrapper">
        
        {/* Logo 區域 */}
<div className="logo-section">
  {/* 不再使用 <img>，改用帶有遮罩樣式的 <div> */}
  <div 
    className="brand-logo-tinted" 
    role="img" 
    aria-label="EasySplit Logo"
  ></div>
</div>

        <AuthForm isSignUp={isSignUp} />

        <button 
          className="toggle-btn"
          style={{ background: 'none', border: 'none', color: '#666', marginTop: '30px', cursor: 'pointer', fontSize: '13px' }}
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? '已有帳號？返回登入' : '忘記密碼？ | 註冊帳號'}
        </button>
      </div>

      <div style={{ position: 'absolute', bottom: '40px', color: '#333', fontSize: '11px', letterSpacing: '4px' }}>
        這群人真的很欠分帳
      </div>
    </div>
  );
};

export default AuthView;