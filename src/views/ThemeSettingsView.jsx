import React, { useState, useEffect } from 'react';
import { Form, message, ColorPicker, Row, Col, ConfigProvider } from 'antd'; 
import { ChevronLeft, Save, Palette, Layout, Type } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const ThemeSettingsView = ({ user, onBack }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 1. 載入 KV 設定
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;
      try {
        const { data } = await supabase.from('user_settings').select('key, value').eq('user_id', user.id);
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
      } catch (error) { console.error("載入失敗", error); }
    };
    loadSettings();
  }, [user?.id, form]);

  // 2. 儲存設定並物理套用
  const handleSave = async (values) => {
    setLoading(true);
    try {
      const toHex = (val) => (typeof val === 'string' ? val : val.toHexString());
      const updates = Object.keys(values).map(key => ({
        user_id: user.id, key: key, value: toHex(values[key]), updated_at: new Date()
      }));

      const { error } = await supabase.from('user_settings').upsert(updates, { onConflict: 'user_id,key' });
      if (error) throw error;
      
      // 即時套用地基 CSS 變數
      updates.forEach(u => {
        const cssVar = `--color-${u.key.replace('theme_', '')}`;
        document.documentElement.style.setProperty(cssVar, u.value);
      });
      message.success('配色已儲存並生效');
    } catch (err) { message.error('儲434失敗：' + err.message); } finally { setLoading(false); }
  };

  return (
    /* 核心物理修復：垂直堆疊防止內容失蹤 */
    <div className="app-main-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      
      {/* 1. 旗艦導航列：絕對置中標題 */}
      <header className="navbar" style={{ flexShrink: 0, position: 'relative', width: '100%' }}>
        <button onClick={onBack} className="hamburger-btn" style={{ zIndex: 10 }}>
          <ChevronLeft size={24} color="#ffffff" />
        </button>
        <span className="nav-brand" style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            whiteSpace: 'nowrap', fontSize: '18px', fontWeight: '900', color: '#ffffff', pointerEvents: 'none'
        }}>
            主題配色設定
        </span>
        <div style={{ width: 44 }}></div>
      </header>

      {/* 2. 內容容器：地基寬度保護 */}
      <div className="content-area-wrapper" style={{ flex: 1, overflowY: 'auto' }}>
        <main className="band-container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
          
          <ConfigProvider theme={{ token: { colorBgElevated: '#1a1a1a', colorText: '#ffffff' } }}>
            <Form form={form} layout="vertical" onFinish={handleSave}>
              
              {/* 配色區塊 1：核心顏色 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingLeft: '4px' }}>
                <Palette size={16} color="var(--color-primary)" />
                <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-sub)' }}>核心配色</span>
              </div>
              <div className="band-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <Row gutter={[20, 20]}>
                  <Col span={12}>
                    <Form.Item name="theme_primary" label={<span style={{color: '#888', fontWeight: 800, fontSize: '13px'}}>主色</span>} style={{ marginBottom: 0 }}>
                      <ColorPicker showText style={{ width: '100%', justifyContent: 'flex-start', background: '#111', border: '1px solid #333' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="theme_cancel" label={<span style={{color: '#888', fontWeight: 800, fontSize: '13px'}}>警告色</span>} style={{ marginBottom: 0 }}>
                      <ColorPicker showText style={{ width: '100%', justifyContent: 'flex-start', background: '#111', border: '1px solid #333' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* 配色區塊 2：背景層次 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingLeft: '4px' }}>
                <Layout size={16} color="var(--color-primary)" />
                <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-sub)' }}>背景層次</span>
              </div>
              <div className="band-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <Row gutter={[20, 20]}>
                  <Col span={12}>
                    <Form.Item name="theme_bg" label={<span style={{color: '#888', fontWeight: 800, fontSize: '13px'}}>App 背景</span>} style={{ marginBottom: 0 }}>
                      <ColorPicker showText style={{ width: '100%', justifyContent: 'flex-start', background: '#111', border: '1px solid #333' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="theme_card" label={<span style={{color: '#888', fontWeight: 800, fontSize: '13px'}}>卡片底色</span>} style={{ marginBottom: 0 }}>
                      <ColorPicker showText style={{ width: '100%', justifyContent: 'flex-start', background: '#111', border: '1px solid #333' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* 配色區塊 3：文字色彩 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingLeft: '4px' }}>
                <Type size={16} color="var(--color-primary)" />
                <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-text-sub)' }}>文字視覺</span>
              </div>
              <div className="band-card" style={{ padding: '24px', marginBottom: '32px' }}>
                <Row gutter={[20, 20]}>
                  <Col span={12}>
                    <Form.Item name="theme_text_main" label={<span style={{color: '#888', fontWeight: 800, fontSize: '13px'}}>主要文字</span>} style={{ marginBottom: 0 }}>
                      <ColorPicker showText style={{ width: '100%', justifyContent: 'flex-start', background: '#111', border: '1px solid #333' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="theme_text_sub" label={<span style={{color: '#888', fontWeight: 800, fontSize: '13px'}}>次要文字</span>} style={{ marginBottom: 0 }}>
                      <ColorPicker showText style={{ width: '100%', justifyContent: 'flex-start', background: '#111', border: '1px solid #333' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <button type="submit" className="band-btn-main" style={{ width: '100%', gap: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={loading}>
                {loading ? '正在儲存配色...' : <><Save size={20} /> 儲存並套用主題</>}
              </button>
            </Form>
          </ConfigProvider>
          
        </main>
      </div>
    </div>
  );
};

export default ThemeSettingsView;