import React, { useEffect, useRef } from 'react';

const ScrollObserver = ({ onIntersect, hasMore, loading }) => {
  const targetRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // 如果這個元件進入畫面 (isIntersecting) 且 還有更多資料 (hasMore) 且 目前沒在載入 (loading)
        if (entry.isIntersecting && hasMore && !loading) {
          onIntersect();
        }
      },
      {
        root: null,
        rootMargin: '100px', // 提早 100px 觸發，讓使用者感覺不到讀取
        threshold: 0.1,
      }
    );

    const currentTarget = targetRef.current;
    if (currentTarget) observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [onIntersect, hasMore, loading]);

  if (!hasMore) return <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontSize: '12px' }}>沒有更多資料了</div>;

  return (
    <div ref={targetRef} style={{ textAlign: 'center', padding: '20px', color: 'var(--color-primary)' }}>
      {loading ? '載入中...' : '下滑載入更多'}
    </div>
  );
};

export default ScrollObserver;