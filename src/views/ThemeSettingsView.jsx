import React, { useState, useEffect } from 'react';
import { Form, message, ColorPicker, ConfigProvider } from 'antd'; 
import { ChevronLeft, Palette, Save } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const ThemeSettingsView = ({ user, onBack }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;
      try {
        const { data } = await supabase.from('user_settings').select('key, value').eq('user_id', user.id).eq('key', 'theme_primary');
        if (data && data.length > 0) form.setFieldsValue({ theme_primary: data[0].value || '#3a8fb7' });
      } catch (error) { console.error("載入失敗", error); }
    };
    loadSettings();
  }, [user?.id, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const colorHex = typeof values.theme_primary === 'string' ? values.theme_primary : values.theme_primary.toHexString();
      document.documentElement.style.setProperty('--color-primary', colorHex);
      const { error } = await supabase.from('user_settings').upsert([{ user_id: user.id, key: 'theme_primary', value: colorHex, updated_at: new Date() }], { onConflict: 'user_id,key' });
      if (error) throw error;
      message.success('主題外觀已同步');
    } catch (err) { message.error('儲存失敗'); } finally { setLoading(false); }
  };

  return (
    <div className="app-main-layout" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      <header className="navbar" style={{ flexShrink: 0 }}>
        <button onClick={onBack} className="hamburger-btn"><ChevronLeft size={24} color="#ffffff" /></button>
        <span className="nav-brand">主題外觀設定</span>
        <div style={{ width: 44 }}></div>
      </header>

      <main className="band-container" style={{ flex: 1, overflowY: 'auto', paddingTop: '24px' }}>
        <ConfigProvider theme={{ token: { colorBgElevated: '#1a1a1a', colorText: '#ffffff' } }}>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingLeft: '8px' }}>
              <Palette size={18} color="var(--color-primary)" />
              <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--color-text-sub)' }}>主題色</span>
            </div>

            {/* ★ 核心修正：移除長方形外框，膠囊撐滿全寬且上下置中 */}
            <div style={{ padding: '24px 0', width: '100%' }}>
              <Form.Item name="theme_primary" style={{ marginBottom: 0 }}>
                <ColorPicker 
                  showText 
                  style={{ 
                    height: '60px', 
                    width: '100%',           // 撐滿整個畫面寬度
                    background: '#1a1a1a', 
                    border: '1px solid #333', 
                    borderRadius: '50px',    // 鋼鐵膠囊造型
                    padding: '0 24px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',    // 內部預覽色塊與 Hex 上下置中
                    justifyContent: 'center', // 內容整體左右置中
                    boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
                  }} 
                />
              </Form.Item>
            </div>

            <p style={{ color: '#666', fontSize: '13px', textAlign: 'center', marginBottom: '40px', lineHeight: '1.6' }}>
              將作為全系統的重點色，包含按鈕、標籤、進度條等。
            </p>

<button 
  type="submit" 
  className="band-btn-main" 
  style={{ 
    width: '100%', 
    height: '56px', 
    borderRadius: '50px', 
    fontWeight: '900',
    display: 'flex',          // ★ 關鍵
    alignItems: 'center',     // ★ 垂直置中
    justifyContent: 'center', // ★ 水平置中
    gap: '10px'               // 圖示與文字間距
  }} 
  disabled={loading}
>
  {loading ? '同步中...' : <><Save size={20} /> 更新主題色</>}
</button>
          </Form>
        </ConfigProvider>
      </main>
    </div>
  );
};

export default ThemeSettingsView;