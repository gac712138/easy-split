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
        // 根據透明度需求調整底色
        backgroundColor: transparent ? 'rgba(0,0,0,0.85)' : 'var(--color-bg-main, #121212)',
        zIndex: 10001, // 權重設為最高，確保蓋過所有 UI
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.3s ease',
        backdropFilter: transparent ? 'blur(10px)' : 'none' // 局部讀取時增加毛玻璃感
      }}
    >
      {/* 注入沉穩的脈動動畫，移除螢光發光效果 */}
      <style>
        {`
          @keyframes heavyPulse {
            0% { 
              opacity: 0.6; 
              transform: scale(0.92);
            }
            50% { 
              opacity: 1; 
              transform: scale(1);
            }
            100% { 
              opacity: 0.6; 
              transform: scale(0.92);
            }
          }
        `}
      </style>

      {/* ★ 鋼鐵質感 Logo */}
      <img 
        src="/og-image.png" 
        alt="EasySplit"
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          marginBottom: '24px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.8)', // 厚重的深色陰影
          //border: '1px solid #333',
          animation: 'heavyPulse 2.5s infinite ease-in-out' // 較慢的頻率顯得更厚重
        }}
      />

      <h1 
        style={{
          fontSize: '20px',
          fontWeight: '900', // 鋼鐵極粗體
          color: '#fff',
          letterSpacing: '4px',
          margin: 0,
          opacity: 0.9
        }}
      >
        {text.toUpperCase()}
      </h1>
      
      <div style={{ 
        marginTop: '12px', 
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {/* 精簡的讀取文字 */}
        <p style={{ 
          color: '#666', 
          fontSize: '11px', 
          fontWeight: '800', // 加粗副標題
          letterSpacing: '2px',
          margin: 0
        }}>
          SYSTEM SYNCING
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;