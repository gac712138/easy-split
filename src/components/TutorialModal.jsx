import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle, Circle } from 'lucide-react';

const TUTORIAL_DATA = [
  {
    id: 1,
    image: '/tutorial/member.png', // 請確認路徑
    title: '成員管理',
    desc: '輕鬆新增與編輯專案成員，設定擁有者權限。'
  },
  {
    id: 2,
    image: '/tutorial/add.png',
    title: '快速記帳',
    desc: '支援多人分帳、墊付與自訂分類，一鍵完成紀錄。'
  },
  {
    id: 3,
    image: '/tutorial/settle.png',
    title: '債務結算',
    desc: '即時查看誰欠誰多少錢，支援一鍵結算功能。'
  },
  {
    id: 4,
    image: '/tutorial/category.png',
    title: '自訂分類',
    desc: '管理常用的帳款類型，讓記帳更符合你的習慣。'
  },
  {
    id: 5,
    image: '/tutorial/settings.png',
    title: '系統設定',
    desc: '個人化主題與安全性設定，打造專屬體驗。'
  }
];

const TutorialModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // 初始化檢查：讀取 LocalStorage
  useEffect(() => {
    const hasSeen = localStorage.getItem('easySplit_tutorial_seen');
    if (!hasSeen) {
      // 稍微延遲一下再跳出，體驗比較好
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('easySplit_tutorial_seen', 'true');
    }
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentIndex < TUTORIAL_DATA.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleClose(); // 最後一張按下一頁就關閉
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        
        {/* 關閉按鈕 */}
        <button onClick={handleClose} style={styles.closeBtn}>
          <X size={24} color="#fff" />
        </button>

        {/* 圖片顯示區 (Carousel) */}
        <div style={styles.imageWrapper}>
           {/* 這裡做一個簡單的滑動效果 */}
           <div style={{
             display: 'flex',
             transform: `translateX(-${currentIndex * 100}%)`,
             transition: 'transform 0.3s ease-in-out',
             height: '100%'
           }}>
             {TUTORIAL_DATA.map((item) => (
               <div key={item.id} style={styles.slide}>
                 <img src={item.image} alt={item.title} style={styles.image} />
               </div>
             ))}
           </div>
        </div>

        {/* 文字說明區 */}
        <div style={styles.content}>
          <h3 style={styles.title}>{TUTORIAL_DATA[currentIndex].title}</h3>
          <p style={styles.desc}>{TUTORIAL_DATA[currentIndex].desc}</p>
        </div>

        {/* 導航控制區 */}
        <div style={styles.footer}>
          
          {/* 進度點點 */}
          <div style={styles.dots}>
            {TUTORIAL_DATA.map((_, idx) => (
              <div 
                key={idx}
                style={{
                  ...styles.dot,
                  background: idx === currentIndex ? 'var(--color-primary, #2563eb)' : '#444',
                  width: idx === currentIndex ? '24px' : '8px'
                }} 
              />
            ))}
          </div>

          {/* 左右按鈕 */}
          <div style={styles.navBtns}>
            <button 
              onClick={handlePrev} 
              disabled={currentIndex === 0}
              style={{...styles.navBtn, opacity: currentIndex === 0 ? 0.3 : 1}}
            >
              <ChevronLeft size={24} />
            </button>
            <button onClick={handleNext} style={styles.navBtnMain}>
              {currentIndex === TUTORIAL_DATA.length - 1 ? '開始使用' : <ChevronRight size={24} />}
            </button>
          </div>
        </div>

        {/* 底部：不再顯示 */}
        <div 
          onClick={() => setDontShowAgain(!dontShowAgain)}
          style={styles.dontShowRow}
        >
          {dontShowAgain ? (
            <CheckCircle size={18} color="var(--color-primary, #2563eb)" />
          ) : (
            <Circle size={18} color="#666" />
          )}
          <span style={{ marginLeft: '8px', color: dontShowAgain ? '#fff' : '#888', fontSize: '13px' }}>
            下次不再顯示教學
          </span>
        </div>

      </div>
    </div>
  );
};

// CSS 樣式 (你可以把這些搬到 CSS 檔案，這裡用 Inline Style 方便直接貼上)
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(8px)',
    zIndex: 10000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  },
  container: {
    width: '100%',
    maxWidth: '360px',
    background: '#1a1a1a',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    border: '1px solid #333',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'rgba(0,0,0,0.3)',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 10
  },
  imageWrapper: {
    width: '100%',
    height: '400px', // 根據你的截圖比例調整高度
    background: '#000',
    overflow: 'hidden',
    position: 'relative'
  },
  slide: {
    minWidth: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px 40px 0' // 預留一點空間給圖片
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain', // 保持比例，顯示完整手機截圖
    filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' // 幫截圖加點陰影更有立體感
  },
  content: {
    padding: '24px 24px 0',
    textAlign: 'center'
  },
  title: {
    color: '#fff',
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  desc: {
    color: '#aaa',
    fontSize: '14px',
    lineHeight: '1.5'
  },
  footer: {
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dots: {
    display: 'flex',
    gap: '6px'
  },
  dot: {
    height: '8px',
    borderRadius: '4px',
    transition: 'all 0.3s ease'
  },
  navBtns: {
    display: 'flex',
    gap: '12px'
  },
  navBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: '1px solid #444',
    background: 'transparent',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  navBtnMain: {
    height: '44px',
    padding: '0 20px',
    borderRadius: '22px',
    border: 'none',
    background: 'var(--color-primary, #2563eb)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  dontShowRow: {
    padding: '16px',
    borderTop: '1px solid #2a2a2a',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    background: '#1f1f1f',
    transition: 'background 0.2s'
  }
};

export default TutorialModal;