// src/components/ConfirmModal.jsx
import React from 'react';
import { Modal, Button, ConfigProvider } from 'antd'; // 引入 ConfigProvider
import { ExclamationCircleFilled } from '@ant-design/icons';

const ConfirmModal = ({ open, onCancel, onConfirm, title, content, loading = false, okText = "確認", cancelText = "取消", isDanger = true }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgElevated: 'var(--color-card)', // 關鍵：強制修改 AntD 彈窗背景色
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
        styles={{ 
          content: { 
            backgroundColor: 'var(--color-card)', // 確保內容區也是深色
            borderRadius: '24px', 
            padding: '24px', 
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          },
          mask: { backdropFilter: 'blur(4px)' } 
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <ExclamationCircleFilled style={{ fontSize: '48px', color: isDanger ? '#ff4d4f' : 'var(--color-primary)', marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
            {title}
          </h3>
          <div style={{ fontSize: '14px', color: 'var(--color-text-sub)', lineHeight: '1.5' }}>
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
              border: 'none', 
              backgroundColor: 'var(--color-bg)', // 底部按鈕背景色
              color: 'var(--color-text-sub)', 
              height: '48px'
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
              backgroundColor: isDanger ? '#ff4d4f' : 'var(--color-primary)' 
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