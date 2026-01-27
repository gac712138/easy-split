import React from 'react';
import { Modal, Button, ConfigProvider } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

const ConfirmModal = ({ 
  open, 
  onCancel, 
  onConfirm, 
  title, 
  content, 
  loading = false,
  okText = "確認",
  cancelText = "取消",
  isDanger = true 
}) => {
  return (
    /* 1. 使用 ConfigProvider 確保 AntD 基礎樣式對齊主題 */
    <ConfigProvider
      theme={{
        token: {
          colorBgElevated: 'var(--color-card)', 
          colorText: 'var(--color-text-main)',
        },
      }}
    >
      <Modal
        open={open}
        title={null} 
        footer={null} 
        closable={false}
        centered
        width={320}
        zIndex={3000}
        /* 2. 鋼鐵規範：背景使用 var(--color-card)，24px 圓角 */
        styles={{ 
          content: { 
            backgroundColor: 'var(--color-card)', 
            borderRadius: '24px', 
            padding: '24px', 
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          },
          mask: { backdropFilter: 'blur(4px)' } 
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          {/* 圖示顏色連動：危險則用紅色，否則用主色 */}
          <ExclamationCircleFilled 
            style={{ 
              fontSize: '48px', 
              color: isDanger ? '#ff4d4f' : 'var(--color-primary)', 
              marginBottom: '16px' 
            }} 
          />
          
          {/* 3. 標題：強制使用 theme_text_main */}
          <h3 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: 'var(--color-text-main)' 
          }}>
            {title}
          </h3>
          
          {/* 4. 內文：強制使用 theme_text_main */}
          <div style={{ 
            fontSize: '14px', 
            color: 'var(--color-text-main)', 
            lineHeight: '1.5',
            opacity: 0.9 
          }}>
            {content}
          </div>
        </div>

        {/* 5. 底部按鈕區：文字全部寫死白色 */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button 
            block 
            size="large" 
            onClick={onCancel}
            style={{ 
              borderRadius: '50px', 
              border: 'none', 
              backgroundColor: 'var(--color-bg)', 
              color: '#ffffff', // 修正：文字寫死白色
              height: '48px',
              fontWeight: 600
            }}
          >
            {cancelText}
          </Button>
          <Button 
            block 
            size="large" 
            type="primary" 
            danger={isDanger} 
            loading={loading} 
            onClick={onConfirm}
            style={{ 
              borderRadius: '50px', 
              fontWeight: 600, 
              height: '48px',
              color: '#ffffff', // 修正：文字寫死白色
              backgroundColor: isDanger ? '#ff4d4f' : 'var(--color-primary)',
              border: 'none',
              boxShadow: 'none'
            }}
          >
            {okText}
          </Button>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default ConfirmModal;