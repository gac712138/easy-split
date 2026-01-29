import React from 'react';
import { Modal, Button, ConfigProvider } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

const AlertModal = ({ 
  isOpen, 
  onConfirm, 
  title, 
  content, 
  okText = "我知道了",
  isDanger = false 
}) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgElevated: '#1a1a1a', 
          colorText: '#ffffff',
        },
      }}
    >
      <Modal
        open={isOpen}
        title={null} 
        footer={null} 
        closable={false}
        centered
        width={320}
        /* 鋼鐵規範：權重設為 10000，確保蓋過所有 UI */
        zIndex={10000} 
        /* 強制掛載在 body */
        getContainer={document.body}
        styles={{ 
          content: { 
            backgroundColor: '#1a1a1a', 
            borderRadius: '24px', 
            padding: '24px', 
            textAlign: 'center',
            boxShadow: '0 12px 48px rgba(0,0,0,0.8)',
            border: '1px solid #333'
          },
          mask: { 
            backdropFilter: 'blur(8px)', 
            backgroundColor: 'rgba(0,0,0,0.75)' 
          } 
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <ExclamationCircleFilled 
            style={{ 
              fontSize: '48px', 
              color: isDanger ? '#ff4d4f' : 'var(--color-primary, #3a8fb7)', 
              marginBottom: '16px' 
            }} 
          />
          
          <h3 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '18px', 
            fontWeight: '900', 
            color: '#ffffff',
            letterSpacing: '-0.02em'
          }}>
            {title}
          </h3>
          
          <div style={{ 
            fontSize: '14px', 
            color: '#888888', 
            lineHeight: '1.6',
            padding: '0 8px'
          }}>
            {content}
          </div>
        </div>

        {/* 單一按鈕佈局 */}
        <Button 
          block 
          size="large" 
          type="primary" 
          onClick={onConfirm}
          style={{ 
            borderRadius: '50px', 
            fontWeight: 800, 
            height: '48px',
            color: '#ffffff',
            backgroundColor: isDanger ? '#ff4d4f' : 'var(--color-primary, #3a8fb7)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          {okText}
        </Button>
      </Modal>
    </ConfigProvider>
  );
};

export default AlertModal;