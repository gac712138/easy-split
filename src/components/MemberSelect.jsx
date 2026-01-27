import React from 'react';
import { Select, ConfigProvider } from 'antd';

const MemberSelect = ({ options = [], value, onChange, loading = false }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: 'var(--color-primary)', 
          colorBgContainer: '#222222', 
          colorBgElevated: 'var(--color-bg-overlay)', 
          colorText: '#ffffff',
          colorTextPlaceholder: '#666666',
          borderRadius: 16, // 對齊表單圓角
          controlHeight: 52,
          /* 關鍵修正：解決太亮看不清楚的問題 */
          colorItemBgSelected: 'var(--color-beige)', // 選中背景改米色
          colorTextItemActive: '#121212',           // 選中文字改深色
        },
      }}
    >
      <div style={{ position: 'relative', width: '100%' }}>
        <Select
          mode="multiple"
          allowClear
          showSearch={false}
          className="band-select-custom"
          style={{ width: '100%' }}
          placeholder={loading ? "載入名單中..." : "點擊選擇成員"}
          value={value}
          onChange={onChange}
          options={options}
          loading={loading}
          /* 確保下拉選單在 Modal 中不被裁切 */
          getPopupContainer={(trigger) => trigger.parentNode}
          /* 自定義標籤：補足疊加感 */
          tagRender={({ label, closable, onClose }) => (
            <span className="band-select-tag" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: '#333', 
              color: 'var(--color-primary)', 
              padding: '2px 12px', 
              borderRadius: '8px', 
              margin: '4px',
              fontSize: '13px',
              fontWeight: '800',
              border: '1px solid #444'
            }}>
              {label}
              {closable && (
                <span onClick={onClose} style={{ cursor: 'pointer', fontSize: '16px', marginLeft: '4px', lineHeight: 1 }}>
                  ×
                </span>
              )}
            </span>
          )}
        />
      </div>
    </ConfigProvider>
  );
};

export default MemberSelect;