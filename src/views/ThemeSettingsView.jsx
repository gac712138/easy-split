import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Form, ColorPicker, message, Button, ConfigProvider } from 'antd';
import { supabase } from '../lib/supabaseClient';

const ThemeSettingsView = ({ onBack, user }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const fetchSettings = async () => {
      const { data } = await supabase.from('user_settings').select('key, value').eq('user_id', user.id);
      if (data) {
        const settingsMap = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
        form.setFieldsValue({
          theme_primary: settingsMap.theme_primary || '#3a8fb7',
          theme_bg: settingsMap.theme_bg || '#121212',
          theme_card: settingsMap.theme_card || '#1e1e1e',
          theme_text_main: settingsMap.theme_text_main || '#ffffff',
          theme_text_sub: settingsMap.theme_text_sub || '#b3b3b3',
        });
      }
    };
    fetchSettings();
  }, [user?.id, form]);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const toHex = (val) => (typeof val === 'string' ? val : val.toHexString());
      const updates = [
        { user_id: user.id, key: 'theme_primary', value: toHex(values.theme_primary) },
        { user_id: user.id, key: 'theme_bg', value: toHex(values.theme_bg) },
        { user_id: user.id, key: 'theme_card', value: toHex(values.theme_card) },
        { user_id: user.id, key: 'theme_text_main', value: toHex(values.theme_text_main) },
        { user_id: user.id, key: 'theme_text_sub', value: toHex(values.theme_text_sub) },
      ];

      const { error } = await supabase.from('user_settings').upsert(updates, { onConflict: 'user_id,key' });
      if (error) throw error;

      // 即時生效
      updates.forEach(u => {
        document.documentElement.style.setProperty(`--color-${u.key.replace('theme_', '')}`, u.value);
      });
      message.success('主題已更新');
    } catch (err) { message.error('儲存失敗'); } finally { setLoading(false); }
  };

  return (
    <div className="app-main-layout">
      {/* 歸一化 Header */}
      <header className="navbar">
        <button onClick={onBack} className="hamburger-btn"><ArrowLeft size={24}/></button>
        <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-main)' }}>主題配色設定</span>
        <div style={{ width: 40 }}></div>
      </header>

      <main className="content-area">
        <ConfigProvider theme={{ token: { colorBgElevated: 'var(--color-card)', colorText: 'var(--color-text-main)' } }}>
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <div className="settings-item-card" style={{ display: 'block' }}>
              <Form.Item name="theme_primary" label={<span style={{color: 'var(--color-text-sub)'}}>品牌主色</span>}>
                <ColorPicker showText style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="theme_bg" label={<span style={{color: 'var(--color-text-sub)'}}>背景底色</span>}>
                <ColorPicker showText style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="theme_card" label={<span style={{color: 'var(--color-text-sub)'}}>卡片/彈窗色</span>}>
                <ColorPicker showText style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="theme_text_main" label={<span style={{color: 'var(--color-text-sub)'}}>主要文字色</span>}>
                <ColorPicker showText style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="theme_text_sub" label={<span style={{color: 'var(--color-text-sub)'}}>次要文字色</span>} style={{ marginBottom: 0 }}>
                <ColorPicker showText style={{ width: '100%' }} />
              </Form.Item>
            </div>
            <button type="submit" disabled={loading} className="band-btn-primary" style={{ height: '56px', marginTop: '24px' }}>
              <Save size={20} style={{ marginRight: '8px' }} />
              儲存我的專屬配色
            </button>
          </Form>
        </ConfigProvider>
      </main>
    </div>
  );
};

export default ThemeSettingsView;