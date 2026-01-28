import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';

const AuthView = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    /* 1. 獨立的 Auth 物理空間，避免與 Dashboard 地基衝突 */
    <div className="auth-full-screen" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: 'var(--color-bg-main)',
      padding: '0 32px',
      position: 'relative'
    }}>
      
      {/* 2. Logo 區域：強化旗艦質感 */}
      <div style={{ marginBottom: '48px', textAlign: 'center' }}>
        <div 
          className="brand-logo-tinted" 
          style={{ 
            width: '80px', 
            height: '80px', 
            margin: '0 auto 24px',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        ></div>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#fff', letterSpacing: '-1.5px', marginBottom: '8px' }}>
          EasySplit
        </h1>
        <p style={{ color: 'var(--color-text-sub)', fontSize: '14px', fontWeight: '600' }}>
          {isSignUp ? '建立您的樂團分帳帳號' : '管理您的團務支出'}
        </p>
      </div>

      {/* 3. 表單容器：確保寬度被物理鎖定 */}
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <AuthForm isSignUp={isSignUp} />
      </div>

      {/* 4. 切換按鈕 */}
      <button 
        className="toggle-btn"
        style={{ 
          background: 'none', border: 'none', color: 'var(--color-text-sub)', 
          marginTop: '32px', cursor: 'pointer', fontSize: '13px', fontWeight: '800',
          letterSpacing: '1px'
        }}
        onClick={() => setIsSignUp(!isSignUp)}
      >
        {isSignUp ? (
          <span>已有帳號？ <span style={{ color: 'var(--color-primary)' }}>返回登入</span></span>
        ) : (
          '註冊新帳號'
        )}
      </button>

      {/* 5. 標語：絕對置中鎖定 */}
      <div style={{ 
        position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
        color: '#222', fontSize: '11px', letterSpacing: '4px', fontWeight: '900',
        whiteSpace: 'nowrap'
      }}>
        這群人真的很欠分帳
      </div>
    </div>
  );
};

export default AuthView;