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
        // 根據 transparent 參數決定是否要全黑底，還是半透明遮罩
        backgroundColor: transparent ? 'rgba(0,0,0,0.85)' : '#121212', 
        zIndex: 10001, // 確保蓋過所有 UI
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.3s ease',
        backdropFilter: transparent ? 'blur(10px)' : 'none' // 只有透明模式才開毛玻璃，節省效能
      }}
    >
      {/* 注入沉穩的脈動動畫 */}
      <style>
        {`
          @keyframes heavyPulse {
            0% { 
              opacity: 0.8; 
              transform: scale(0.95);
              filter: brightness(1);
            }
            50% { 
              opacity: 1; 
              transform: scale(1.02);
              filter: brightness(1.2); /* 稍微亮一點，像呼吸 */
            }
            100% { 
              opacity: 0.8; 
              transform: scale(0.95);
              filter: brightness(1);
            }
          }
        `}
      </style>

      {/* ★ 你的 Logo (請確保 public 資料夾有 og-image.png) */}
      <img 
        src="/og-image.png" 
        alt="EasySplit"
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '20px', // 圓角矩形，像 App Icon
          marginBottom: '24px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', // 深邃陰影
          animation: 'heavyPulse 3s infinite ease-in-out', // 3秒慢速呼吸
          objectFit: 'cover'
        }}
      />

      {/* 主標題 (顯示傳入的狀態文字，如：驗證中...) */}
      <h1 
        style={{
          fontSize: '18px',
          fontWeight: '700', 
          color: '#fff',
          letterSpacing: '2px',
          margin: 0,
          opacity: 0.95,
          textTransform: 'uppercase' // 英文字母自動轉大寫
        }}
      >
        {text}
      </h1>
      
      {/* 裝飾性副標題 (增加科技感) */}
      <div style={{ 
        marginTop: '8px', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#2563eb', marginRight: '8px', boxShadow: '0 0 8px #2563eb' }}></div>
        <p style={{ 
          color: '#555', 
          fontSize: '10px', 
          fontWeight: '800', 
          letterSpacing: '3px',
          margin: 0,
          fontFamily: 'monospace' // 等寬字體更有系統感
        }}>
          SYSTEM PROCESSING
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;