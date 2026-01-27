import React, { useState, useEffect, useMemo } from 'react';
import { DatePicker as AntDatePicker, ConfigProvider } from 'antd'; 
import { DatePicker as MobileWheelPicker } from 'antd-mobile'; 
import { Calendar } from 'lucide-react'; // 統一使用 Lucide 保持風格一致
import dayjs from 'dayjs';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => { setIsMobile(window.innerWidth <= 768); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

// --- 手機版：保留 getContainer={null} 邏輯 ---
const WheelDatePicker = ({ value, onChange, placeholder, style }) => {
  const [visible, setVisible] = useState(false);
  const dateValue = value ? (dayjs.isDayjs(value) ? value.toDate() : value) : new Date();
  
  const minDate = useMemo(() => dayjs().subtract(5, 'year').toDate(), []);
  const maxDate = useMemo(() => dayjs().add(5, 'year').toDate(), []);

  return (
    <>
      <div 
        onClick={() => setVisible(true)}
        className="band-input-pill" /* 調用地基圓角與背景樣式 */
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          padding: '0 16px',
          height: '50px',
          ...style
        }}
      >
        <span style={{ color: value ? 'var(--color-text-main)' : 'var(--color-text-sub)', fontSize: '14px' }}>
          {value ? dayjs(value).format('YYYY-MM-DD') : (placeholder || "選擇日期")}
        </span>
        <Calendar size={16} color="var(--color-text-sub)" />
      </div>

      <MobileWheelPicker
        visible={visible}
        onClose={() => setVisible(false)}
        onConfirm={(val) => {
          onChange(dayjs(val));
          setVisible(false);
        }}
        value={dateValue}
        title="選擇日期"
        confirmText="確定"
        cancelText="取消"
        precision="day"
        min={minDate}
        max={maxDate}
        getContainer={null} /* 你的關鍵修正：保留原位渲染以利 z-index 穿透 */
        style={{
            zIndex: 99999,
            '--z-index': '99999',
            '--adm-color-primary': 'var(--color-primary)',
            '--adm-color-background': 'var(--color-bg-pill)', /* 對齊地基深色背景 */
            '--adm-color-text': 'var(--color-text-main)',
            '--header-button-font-size': '16px',
            '--item-height': '48px',
        }}
      />
    </>
  );
};

// --- 電腦版：同步地基 50px 高度 ---
const DesktopDatePicker = ({ value, onChange, placeholder, style }) => {
  return (
    <ConfigProvider theme={{
        token: {
            colorPrimary: '#3a8fb7',
            colorBgContainer: 'var(--color-bg-pill)',
            colorText: '#ffffff',
            borderRadius: 16,
            controlHeight: 50 /* 對齊地基 input 高度 */
        }
    }}>
        <AntDatePicker
          value={value ? dayjs(value) : null}
          onChange={onChange}
          placeholder={placeholder || "請選擇日期"}
          className="band-input-pill"
          style={{ 
            width: '100%', 
            border: '1px solid var(--color-border)',
            boxShadow: 'none', 
            ...style 
          }} 
          format="YYYY-MM-DD"
          allowClear={false} 
          inputReadOnly 
          getPopupContainer={() => document.body}
          popupStyle={{ zIndex: 99999 }}
        />
    </ConfigProvider>
  );
};

const ResponsiveDatePicker = (props) => {
  const isMobile = useIsMobile();
  return isMobile ? <WheelDatePicker {...props} /> : <DesktopDatePicker {...props} />;
};

export default ResponsiveDatePicker;