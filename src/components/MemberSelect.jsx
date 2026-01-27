import React from 'react';
import { Select, ConfigProvider } from 'antd';

/**
 * MemberSelect：改為接收外部預載的 options
 */
const MemberSelect = ({ options = [], value, onChange, loading = false }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3a8fb7', 
          colorBgContainer: '#1a1a1a', 
          colorBgElevated: '#1f1f1f', 
          colorText: '#ffffff',
          colorTextPlaceholder: '#666666',
          borderRadius: 50,
          controlHeight: 52,
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
          options={options} // 直接使用 Props 傳入的選項
          loading={loading}
          getPopupContainer={(trigger) => trigger.parentNode}
          tagRender={({ label, closable, onClose }) => (
            <span className="band-select-tag">
              {label}
              {closable && (
                <span onClick={onClose} style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
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