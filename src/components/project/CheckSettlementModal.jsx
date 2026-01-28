import React, { useState, useEffect } from 'react';
import { Modal, Input, message, ConfigProvider } from 'antd';
import { CheckCircle, X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const CheckSettlementModal = ({ isOpen, onClose, item, onRefresh, getName }) => {
  const [loading, setLoading] = useState(false);
  const [remark, setRemark] = useState('');

  // 每次打開時重置
  useEffect(() => {
    if (isOpen && item) {
      setRemark(item.remark || '');
    }
  }, [isOpen, item]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('project_settlements')
        .update({ 
          is_cleared: true,
          remark: remark
        })
        .eq('id', item.id);

      if (error) throw error;

      message.success('已確認收款');
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      message.error('操作失敗');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgElevated: '#1e1e1e', // 彈窗背景色
          colorText: '#fff',          // 文字顏色
          colorTextHeading: '#fff',   // 標題顏色
          colorBorder: '#333',        // 邊框顏色
          colorPrimary: '#4caf50',    // 主色 (配合核銷用綠色)
        },
        components: {
          Input: {
            colorBgContainer: '#2c2c2c', // 輸入框背景
            colorBorder: '#444',
            colorTextPlaceholder: '#666',
            activeBorderColor: '#4caf50',
          },
          Modal: {
            contentBg: '#1e1e1e',
            headerBg: '#1e1e1e',
          }
        }
      }}
    >
      <Modal
        open={isOpen}
        onCancel={onClose}
        footer={null} // 我們自定義 Footer 按鈕
        closeIcon={<X size={20} color="#666" />}
        centered
        width={360} // 手機版適合的寬度
        styles={{
          content: {
            padding: '24px',
            borderRadius: '24px',
            border: '1px solid #333',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          },
          mask: {
            backdropFilter: 'blur(4px)', // 毛玻璃背景
            background: 'rgba(0, 0, 0, 0.6)'
          }
        }}
      >
        {/* 1. 標題區 */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            width: '50px', height: '50px', borderRadius: '50%', 
            background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <CheckCircle size={28} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: 0 }}>
            確認核銷此筆款項？
          </h3>
          <p style={{ color: '#888', fontSize: '14px', marginTop: '4px' }}>
            請確認您已收到或支付款項
          </p>
        </div>

        {/* 2. 交易內容卡片 */}
        <div style={{ 
          background: '#2c2c2c', 
          padding: '16px', 
          borderRadius: '16px', 
          marginBottom: '20px', 
          border: '1px solid #333',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>
             {getName(item.from_personnel_id)} <span style={{ fontSize: '12px' }}>付給</span> {getName(item.to_personnel_id)}
          </div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#4caf50', letterSpacing: '1px' }}>
            ${Number(item.amount).toLocaleString()}
          </div>
        </div>

        {/* 3. 輸入備註 */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', color: '#ccc', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>
            備註 (選填)
          </label>
          <Input.TextArea 
            placeholder="例如：已用 Line Pay 轉帳、現金已給..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            rows={3}
            maxLength={50}
            showCount
            style={{ borderRadius: '12px', fontSize: '14px', color: '#fff' }}
          />
        </div>

        {/* 4. 自定義按鈕區 */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={onClose}
            style={{ 
              flex: 1,
              padding: '14px',
              borderRadius: '14px',
              border: '1px solid #444',
              background: 'transparent',
              color: '#ccc',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            取消
          </button>
          
          <button 
            onClick={handleConfirm}
            disabled={loading}
            style={{ 
              flex: 1,
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: '#4caf50', // 綠色代表核銷
              color: '#000',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            {loading ? '處理中...' : '確認核銷'}
          </button>
        </div>

      </Modal>
    </ConfigProvider>
  );
};

export default CheckSettlementModal;