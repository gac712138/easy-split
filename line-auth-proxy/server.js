/**
 * LINE Auth Proxy for Self-hosted Supabase
 * 修正版：支援現有帳號補齊 line_user_id 與自動 Metadata 同步
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ===== 1. 環境變數驗證 =====
const requiredEnvVars = [
  'SUPABASE_URL',
  'SERVICE_ROLE_KEY',
  'LINE_CHANNEL_ID',
  'LINE_CHANNEL_SECRET',
  'LINE_REDIRECT_URI',
  'FRONTEND_URL'
];

console.log('--- 啟動環境變數檢查 ---');
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ 缺少必要的環境變數: ${envVar}`);
    process.exit(1);
  } else {
    console.log(`✅ ${envVar}: 已設定`);
  }
}

// ===== 2. Supabase Admin Client 初始化 =====
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// ===== 3. Middleware 設定 =====
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== 4. 暫存 State 儲存與清理 =====
const stateStorage = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of stateStorage.entries()) {
    if (now - data.timestamp > 600000) stateStorage.delete(state);
  }
}, 600000);

function generateSecureState() {
  return crypto.randomBytes(32).toString('hex');
}

function generateVirtualEmail(lineUserId) {
  return `line_${lineUserId}@easysplit.internal`;
}

// ===== 5. 路由定義 =====

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'LINE Auth Proxy', timestamp: new Date().toISOString() });
});

/**
 * 1️⃣ LINE OAuth 初始化端點
 */
app.get('/auth/line', (req, res) => {
  try {
    const state = generateSecureState();
    stateStorage.set(state, { timestamp: Date.now() });

    const lineAuthUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
    lineAuthUrl.searchParams.append('response_type', 'code');
    lineAuthUrl.searchParams.append('client_id', process.env.LINE_CHANNEL_ID);
    lineAuthUrl.searchParams.append('redirect_uri', process.env.LINE_REDIRECT_URI);
    lineAuthUrl.searchParams.append('state', state);
    lineAuthUrl.searchParams.append('scope', 'profile openid email');
    
    // ✨ 註解掉 prompt=consent：除非必要，否則不再強制跳出授權畫面，提升 UX
    // lineAuthUrl.searchParams.append('prompt', 'consent'); 

    console.log(`🚀 重定向到 LINE OAuth: ${lineAuthUrl.toString()}`);
    res.redirect(lineAuthUrl.toString());
  } catch (error) {
    console.error('LINE OAuth 初始化失敗:', error);
    res.status(500).json({ error: 'OAuth 初始化失敗', message: error.message });
  }
});

/**
 * 2️⃣ LINE OAuth 回調端點
 */
app.get('/auth/line/callback', async (req, res) => {
  try {
    const { code, state, error: lineError } = req.query;

    if (lineError) {
      console.error('LINE OAuth 錯誤:', lineError);
      return res.redirect(`${process.env.FRONTEND_URL}?error=line_oauth_failed`);
    }

    if (!stateStorage.has(state)) {
      console.error('無效或過期的 state:', state);
      return res.redirect(`${process.env.FRONTEND_URL}?error=invalid_state`);
    }
    stateStorage.delete(state);

    // 步驟 A: 用 code 換取 Token
    console.log('🔄 步驟 A: 交換 Access Token...');
    const tokenResponse = await axios.post('https://api.line.me/oauth2/v2.1/token', {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.LINE_REDIRECT_URI,
      client_id: process.env.LINE_CHANNEL_ID,
      client_secret: process.env.LINE_CHANNEL_SECRET
    }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

    const { access_token, id_token } = tokenResponse.data;

    // 步驟 B: 取得 LINE Profile
    console.log('🔄 步驟 B: 取得 LINE 用戶資料...');
    const profileResponse = await axios.get('https://api.line.me/v2/profile', {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });
    const lineProfile = profileResponse.data;

    // 步驟 C: 解析 Email
    let userEmail = null;
    if (id_token) {
      try {
        const payload = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64').toString('utf-8'));
        userEmail = payload.email;
      } catch (e) { console.error('Email 解析失敗'); }
    }
    
    const finalEmail = userEmail || generateVirtualEmail(lineProfile.userId);
    console.log(`📧 處理用戶: ${finalEmail} (LINE ID: ${lineProfile.userId})`);

    // 🔄 步驟 D: 建立或更新 Supabase 用戶 Metadata
    // 這一步最重要：確保 line_user_id 一定會進到 auth.users 裡
    let targetUserId = null;
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: finalEmail,
      email_confirm: true,
      user_metadata: { 
        name: lineProfile.displayName, 
        avatar_url: lineProfile.pictureUrl, 
        line_user_id: lineProfile.userId,
        provider: 'line' 
      }
    });

    if (createError && (createError.code === 'email_exists' || createError.message?.includes('already'))) {
      console.log('✅ 帳號已存在，執行強制 Metadata 同步...');
      // 找出舊用戶並更新 Metadata
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const existingUser = users.find(u => u.email === finalEmail);
      if (existingUser) {
        targetUserId = existingUser.id;
        await supabase.auth.admin.updateUserById(existingUser.id, {
          user_metadata: { 
            line_user_id: lineProfile.userId,
            avatar_url: lineProfile.pictureUrl 
          }
        });
      }
    } else {
      targetUserId = userData.user.id;
      console.log(`✅ 成功建立新用戶: ${targetUserId}`);
    }

    // 步驟 E: 產生 Magic Link 登入
    console.log('🔄 步驟 E: 產生登入 Hash...');
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: finalEmail,
      options: { redirectTo: process.env.FRONTEND_URL }
    });

    if (linkError) throw linkError;

    // 步驟 F & G: 驗證 Hash 換取 Session
    const actionLink = linkData.properties.action_link;
    const url = new URL(actionLink);
    const tokenValue = url.searchParams.get('token_hash') || url.searchParams.get('token');
    
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenValue,
      type: 'magiclink'
    });

    if (verifyError) throw verifyError;

    // 步驟 H: 回傳 Token 給前端 (透過 URL Hash)
    const { access_token: at, refresh_token: rt, expires_in: ex } = verifyData.session;
    const redirectUrl = `${process.env.FRONTEND_URL}#access_token=${at}&refresh_token=${rt}&expires_in=${ex}&token_type=bearer&type=magiclink`;

    console.log(`🎉 登入成功，導向前端: ${finalEmail}`);
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('❌ 回調處理失敗:', error.message);
    res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
  }
});

// ===== 6. 啟動伺服器 =====
app.listen(PORT, () => {
  console.log('🚀 LINE Auth Proxy 運行中...');
  console.log(`🔗 入口網址: http://localhost:${PORT}/auth/line`);
});