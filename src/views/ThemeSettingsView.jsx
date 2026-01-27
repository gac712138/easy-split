import React, { useState, useEffect } from 'react';
import { Form, message, Card, Button, ColorPicker, Row, Col, ConfigProvider } from 'antd'; 
import { ArrowLeft, Save } from 'lucide-react'; // 統一使用 lucide
import { supabase } from '../lib/supabaseClient';

const ThemeSettingsView = ({ user, onBack }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // 1. 樣式定義：對齊 24px Padding 與藥丸卡片感
  const pickerStyle = { display: 'flex', justifyContent: 'flex-start', width: '100%' };
  const sectionCardStyle = {
    borderRadius: '20px',
    border: 'none',
    backgroundColor: 'var(--color-card)', 
    boxShadow: 'none',
    marginBottom: '16px' 
  };
  const sectionTitleStyle = {
    fontSize: '14px', 
    fontWeight: 'bold', 
    color: 'var(--color-text-sub)', 
    marginBottom: '12px', 
    marginLeft: '4px'
  };

  // 2. 載入 KV 設定資料
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return; // 解決 image_814994.png 的 undefined 報錯
      try {
        const { data } = await supabase
          .from('user_settings')
          .select('key, value')
          .eq('user_id', user.id);
        
        if (data) {
          const map = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
          form.setFieldsValue({
            theme_primary: map.theme_primary || '#3a8fb7',
            theme_cancel: map.theme_cancel || '#FF4D4F',
            theme_bg: map.theme_bg || '#121212',
            theme_card: map.theme_card || '#1e1e1e',
            theme_text_main: map.theme_text_main || '#ffffff',
            theme_text_sub: map.theme_text_sub || '#b3b3b3',
          });
        }
      } catch (error) {
        console.error("載入失敗", error);
      } finally {
        setInitialLoading(false);
      }
    };
    loadSettings();
  }, [user?.id, form]);

  // 3. 儲存設定並即時套用
  const handleSave = async (values) => {
    setLoading(true);
    try {
      const toHex = (val) => (typeof val === 'string' ? val : val.toHexString());
      
      const updates = Object.keys(values).map(key => ({
        user_id: user.id,
        key: key,
        value: toHex(values[key]),
        updated_at: new Date()
      }));

      const { error } = await supabase
        .from('user_settings')
        .upsert(updates, { onConflict: 'user_id,key' });
      
      if (error) throw error;
      
      // 即時套用 CSS 變數
      updates.forEach(u => {
        const cssVar = `--color-${u.key.replace('theme_', '')}`;
        document.documentElement.style.setProperty(cssVar, u.value);
      });

      message.success('配色設定已儲存並生效');
    } catch (err) { 
      message.error('儲存失敗：' + err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="app-main-layout">
      {/* 統一 64px Header */}
      <header className="navbar">
        <button onClick={onBack} className="hamburger-btn">
          <ArrowLeft size={24} color="var(--color-text-main)" />
        </button>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
          主題配色設定
        </span>
        <div style={{ width: 40 }}></div>
      </header>

      <main className="content-area">
        <ConfigProvider
          theme={{
            token: {
              colorBgElevated: 'var(--color-card)',
              colorText: 'var(--color-text-main)',
            },
          }}
        >
          <Form form={form} layout="vertical" onFinish={handleSave}>
            
            <div style={sectionTitleStyle}>核心配色</div>
            <Card bordered={false} style={sectionCardStyle} bodyStyle={{ padding: '20px' }}>
              <Row gutter={[20, 20]}>
                <Col span={12}>
                  <Form.Item name="theme_primary" label={<span style={{color: 'var(--color-text-main)'}}>主色 (虎小島藍)</span>} style={{ marginBottom: 0 }}>
                    <ColorPicker showText style={pickerStyle} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="theme_cancel" label={<span style={{color: 'var(--color-text-main)'}}>警告/取消色</span>} style={{ marginBottom: 0 }}>
                    <ColorPicker showText style={pickerStyle} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <div style={sectionTitleStyle}>背景層次</div>
            <Card bordered={false} style={sectionCardStyle} bodyStyle={{ padding: '20px' }}>
              <Row gutter={[20, 20]}>
                <Col span={12}>
                  <Form.Item name="theme_bg" label={<span style={{color: 'var(--color-text-main)'}}>App 背景</span>} style={{ marginBottom: 0 }}>
                    <ColorPicker showText style={pickerStyle} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="theme_card" label={<span style={{color: 'var(--color-text-main)'}}>卡片底色</span>} style={{ marginBottom: 0 }}>
                    <ColorPicker showText style={pickerStyle} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <div style={sectionTitleStyle}>文字色彩</div>
            <Card bordered={false} style={sectionCardStyle} bodyStyle={{ padding: '20px' }}>
              <Row gutter={[20, 20]}>
                <Col span={12}>
                  <Form.Item name="theme_text_main" label={<span style={{color: 'var(--color-text-main)'}}>主要文字</span>} style={{ marginBottom: 0 }}>
                    <ColorPicker showText style={pickerStyle} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="theme_text_sub" label={<span style={{color: 'var(--color-text-main)'}}>次要文字</span>} style={{ marginBottom: 0 }}>
                    <ColorPicker showText style={pickerStyle} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 按鈕文字寫死白色 */}
            <button 
              type="submit" 
              className="band-btn-primary" 
              disabled={loading}
              style={{ marginTop: '10px', color: '#ffffff' }} 
            >
              {loading ? '儲存中...' : <><Save size={20} style={{marginRight: 8}}/> 儲存我的專屬配色</>}
            </button>
          </Form>
        </ConfigProvider>
      </main>
    </div>
  );
};

export default ThemeSettingsView;