import React from 'react';

const LoadingScreen = ({ text = "EasySplit", transparent = false }) => {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        // 如果 transparent=true，使用半透明黑底 (適合局部讀取)，否則全黑 (適合初始載入)
        backgroundColor: transparent ? 'rgba(0,0,0,0.7)' : 'var(--color-bg-main, #000)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.3s ease'
      }}
    >
      {/* 注入呼吸燈動畫樣式 */}
      <style>
        {`
          @keyframes breathe {
            0% { 
              opacity: 0.4; 
              transform: scale(0.98);
              text-shadow: 0 0 0px rgba(255, 215, 0, 0); 
            }
            50% { 
              opacity: 1; 
              transform: scale(1.05);
              text-shadow: 0 0 20px var(--color-primary, #ffd700);
            }
            100% { 
              opacity: 0.4; 
              transform: scale(0.98);
              text-shadow: 0 0 0px rgba(255, 215, 0, 0);
            }
          }
        `}
      </style>

      <h1 
        style={{
          fontSize: '32px',
          fontWeight: '900',
          color: '#fff',
          letterSpacing: '2px',
          // 套用動畫：名稱 期間 曲線 次數
          animation: 'breathe 2s infinite ease-in-out',
          margin: 0
        }}
      >
        {text}
      </h1>
      
      <p style={{ 
        marginTop: '16px', 
        color: '#666', 
        fontSize: '12px', 
        fontWeight: '500',
        letterSpacing: '1px' 
      }}>
        LOADING...
      </p>
    </div>
  );
};

export default LoadingScreen;