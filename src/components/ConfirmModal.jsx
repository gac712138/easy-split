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
    <ConfigProvider
      theme={{
        token: {
          colorBgElevated: '#1a1a1a', // 對齊 var(--color-bg-pill)
          colorText: '#ffffff',
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
        /* 鋼鐵規範：權重設為 10000，確保蓋過 Sidebar 與所有彈窗 */
        zIndex={10000} 
        /* 強制掛載在 body，不受父組件 overflow 影響 */
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
              color: isDanger ? '#ff4d4f' : '#3a8fb7', 
              marginBottom: '16px' 
            }} 
          />
          
          <h3 style={{ 
            margin: '0 0 8px 0', 
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
            lineHeight: '1.6'
          }}>
            {content}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button 
            block 
            size="large" 
            onClick={onCancel}
            style={{ 
              borderRadius: '50px', 
              border: '1px solid #333', 
              backgroundColor: '#252525', 
              color: '#ffffff', 
              height: '48px',
              fontWeight: 800
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
              fontWeight: 800, 
              height: '48px',
              color: '#ffffff',
              backgroundColor: isDanger ? '#ff4d4f' : '#3a8fb7',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
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