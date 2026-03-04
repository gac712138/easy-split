/**
 * LINE Auth Proxy for Self-hosted Supabase
 * 
 * 此服務作為 LINE OAuth 與 Supabase 之間的橋樑，
 * 負責處理 LINE 認證流程並自動在 Supabase 中建立用戶。
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ===== 環境變數驗證 =====
const requiredEnvVars = [
  'SUPABASE_URL',
  'SERVICE_ROLE_KEY',
  'LINE_CHANNEL_ID',
  'LINE_CHANNEL_SECRET',
  'LINE_REDIRECT_URI',
  'FRONTEND_URL'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ 缺少必要的環境變數: ${envVar}`);
    process.exit(1);
  }
}

// ===== Supabase Admin Client 初始化 =====
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

// ===== Middleware 設定 =====
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== 暫存 state 的簡單記憶體儲存 =====
// 生產環境建議使用 Redis 或其他持久化儲存
const stateStorage = new Map();

// 清理過期的 state（每 10 分鐘）
setInterval(() => {
  const now = Date.now();
  for (const [state, data] of stateStorage.entries()) {
    if (now - data.timestamp > 600000) { // 10 分鐘過期
      stateStorage.delete(state);
    }
  }
}, 600000);

// ===== 工具函數 =====

/**
 * 產生安全的隨機 state
 */
function generateSecureState() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 根據 LINE userId 產生虛擬 Email
 */
function generateVirtualEmail(lineUserId) {
  return `line_${lineUserId}@easysplit.internal`;
}

/**
 * 檢查或建立 Supabase 用戶
 */
async function ensureSupabaseUser(virtualEmail, lineProfile) {
  try {
    // 先嘗試查找現有用戶
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('查詢用戶列表失敗:', listError);
      throw listError;
    }

    // 檢查是否已存在
    const existingUser = existingUsers.users?.find(user => user.email === virtualEmail);
    
    if (existingUser) {
      console.log(`✅ 找到現有用戶: ${existingUser.id}`);
      return existingUser;
    }

    // 建立新用戶
    console.log(`🆕 建立新用戶: ${virtualEmail}`);
    const { data: newUserData, error: createError } = await supabase.auth.admin.createUser({
      email: virtualEmail,
      email_confirm: true,
      user_metadata: {
        name: lineProfile.displayName,
        avatar_url: lineProfile.pictureUrl,
        provider: 'line',
        line_user_id: lineProfile.userId
      },
      app_metadata: {
        provider: 'line',
        providers: ['line']
      }
    });

    if (createError) {
      // 如果用戶已存在，這是正常情況，直接繼續
      if (createError.code === 'email_exists') {
        console.log(`ℹ️  用戶已存在，繼續登入流程: ${virtualEmail}`);
        // 嘗試重新查找該用戶
        const { data: retryUsers } = await supabase.auth.admin.listUsers();
        const existingUser = retryUsers.users?.find(user => user.email === virtualEmail);
        if (existingUser) {
          return existingUser;
        }
        // 如果還是找不到，就建立一個基本的用戶對象供後續使用
        return { email: virtualEmail };
      }
      console.error('建立用戶失敗:', createError);
      throw createError;
    }

    console.log(`✅ 成功建立用戶: ${newUserData.user.id}`);
    return newUserData.user;

  } catch (error) {
    console.error('ensureSupabaseUser 錯誤:', error);
    throw error;
  }
}

// ===== 路由定義 =====

/**
 * 健康檢查端點
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'LINE Auth Proxy',
    timestamp: new Date().toISOString()
  });
});

/**
 * 1️⃣ LINE OAuth 初始化端點
 * GET /auth/line
 */
app.get('/auth/line', (req, res) => {
  try {
    // 產生安全的 state
    const state = generateSecureState();
    
    // 儲存 state 至記憶體（附帶時間戳記）
    stateStorage.set(state, {
      timestamp: Date.now(),
      referrer: req.get('Referer') || process.env.FRONTEND_URL
    });

    // 組合 LINE OAuth 授權網址
    const lineAuthUrl = new URL('https://access.line.me/oauth2/v2.1/authorize');
    lineAuthUrl.searchParams.append('response_type', 'code');
    lineAuthUrl.searchParams.append('client_id', process.env.LINE_CHANNEL_ID);
    lineAuthUrl.searchParams.append('redirect_uri', process.env.LINE_REDIRECT_URI);
    lineAuthUrl.searchParams.append('state', state);
    lineAuthUrl.searchParams.append('scope', 'profile openid email');

    console.log(`🔄 重定向到 LINE OAuth: ${lineAuthUrl.toString()}`);
    
    // 重定向到 LINE 認證頁面
    res.redirect(lineAuthUrl.toString());

  } catch (error) {
    console.error('LINE OAuth 初始化失敗:', error);
    res.status(500).json({ 
      error: 'OAuth 初始化失敗',
      message: error.message 
    });
  }
});

/**
 * 2️⃣ LINE OAuth 回調端點
 * GET /auth/line/callback
 */
app.get('/auth/line/callback', async (req, res) => {
  try {
    const { code, state, error: lineError } = req.query;

    // 檢查 LINE 是否回傳錯誤
    if (lineError) {
      console.error('LINE OAuth 錯誤:', lineError);
      return res.redirect(`${process.env.FRONTEND_URL}?error=line_oauth_failed`);
    }

    // 檢查必要參數
    if (!code || !state) {
      console.error('缺少必要參數: code 或 state');
      return res.redirect(`${process.env.FRONTEND_URL}?error=missing_params`);
    }

    // 驗證 state
    const storedState = stateStorage.get(state);
    if (!storedState) {
      console.error('無效或過期的 state:', state);
      return res.redirect(`${process.env.FRONTEND_URL}?error=invalid_state`);
    }

    // 清理使用過的 state
    stateStorage.delete(state);

    console.log('🔄 步驟 A: 用 code 換取 Access Token...');

    // 步驟 A: 換取 Access Token
    const tokenResponse = await axios.post('https://api.line.me/oauth2/v2.1/token', {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.LINE_REDIRECT_URI,
      client_id: process.env.LINE_CHANNEL_ID,
      client_secret: process.env.LINE_CHANNEL_SECRET
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, id_token } = tokenResponse.data;
    console.log('✅ 成功取得 Access Token 和 ID Token');

    console.log('🔄 步驟 B: 取得用戶資料...');

    // 步驟 B: 取得用戶資料
    const profileResponse = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    const lineProfile = profileResponse.data;
    console.log(`✅ 成功取得用戶資料: ${lineProfile.displayName} (${lineProfile.userId})`);

    // 步驟 C: 從 id_token 解碼取得真實 Email
    console.log('🔄 步驟 C: 解碼 id_token 取得 Email...');
    let userEmail = null;
    
    if (id_token) {
      try {
        // 使用原生 Node.js 解碼 JWT payload (不需要驗證簽章，因為來自 LINE 官方)
        const payload = JSON.parse(
          Buffer.from(id_token.split('.')[1], 'base64').toString('utf-8')
        );
        userEmail = payload.email;
        
        if (userEmail) {
          console.log(`✅ 取得真實 Email: ${userEmail}`);
        } else {
          console.log('⚠️  使用者 LINE 帳號未綁定 Email，使用虛擬信箱');
        }
      } catch (decodeError) {
        console.error('⚠️  解碼 id_token 失敗:', decodeError.message);
      }
    }
    
    // 防呆機制：如果沒有真實 Email，使用虛擬信箱
    const finalEmail = userEmail || generateVirtualEmail(lineProfile.userId);
    console.log(`📧 最終使用 Email: ${finalEmail}`);

    // 步驟 D: 嘗試建立 Supabase 用戶（聰明的帳號綁定）
    console.log('🔄 步驟 D: 建立或綁定 Supabase 用戶...');
    
    try {
      const { data: newUserData, error: createError } = await supabase.auth.admin.createUser({
        email: finalEmail,
        email_confirm: true,
        user_metadata: {
          name: lineProfile.displayName,
          avatar_url: lineProfile.pictureUrl,
          provider: 'line',
          line_user_id: lineProfile.userId
        },
        app_metadata: {
          provider: 'line',
          providers: ['line']
        }
      });

      if (createError) {
        // 攔截 email_exists 錯誤，這是正常情況（帳號已存在，執行綁定）
        if (createError.code === 'email_exists' || 
            createError.message?.includes('already been registered')) {
          console.log('✅ 帳號已存在，直接執行登入綁定');
        } else {
          // 其他錯誤才需要 throw
          console.error('建立用戶時發生未預期的錯誤:', createError);
          throw createError;
        }
      } else {
        console.log(`✅ 成功建立新用戶: ${newUserData.user.id}`);
      }
    } catch (error) {
      console.error('建立用戶過程中發生錯誤:', error);
      throw error;
    }

    // 步驟 E: 產生 Magic Link（無論新舊帳號都使用同一個流程）
    console.log('🔄 步驟 E: 產生 Magic Link...');
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: finalEmail,
      options: {
        redirectTo: process.env.FRONTEND_URL
      }
    });

    if (linkError) {
      console.error('Magic Link 產生失敗:', linkError);
      throw linkError;
    }

    console.log('✅ 成功產生 Magic Link');

    // 步驟 F: 從 action_link 提取 token 並驗證
    console.log('🔄 步驟 F: 提取 token 並驗證...');
    const actionLink = linkData.properties.action_link;
    const url = new URL(actionLink);
    const token = url.searchParams.get('token');
    const type = url.searchParams.get('type') || 'magiclink';

    if (!token) {
      console.error('❌ 無法從 action_link 中提取 token');
      throw new Error('Token extraction failed');
    }

    console.log('🔄 步驟 G: 驗證 OTP 並獲取 session...');
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email: finalEmail,
      token: token,
      type: type
    });

    if (verifyError) {
      console.error('OTP 驗證失敗:', verifyError);
      throw verifyError;
    }

    if (!verifyData.session) {
      console.error('❌ 驗證成功但沒有返回 session');
      throw new Error('No session returned');
    }

    console.log('✅ 成功驗證並獲取 session');

    // 步驟 H: 組合帶有 token 的前端網址（Hash 模式讓前端自動登入）
    const frontendUrl = `${process.env.FRONTEND_URL}#access_token=${verifyData.session.access_token}&refresh_token=${verifyData.session.refresh_token}&expires_in=${verifyData.session.expires_in}&token_type=bearer&type=magiclink`;

    console.log('🔄 步驟 H: 重定向到前端 (已登入狀態)...');
    res.redirect(frontendUrl);

  } catch (error) {
    console.error('LINE OAuth 回調處理失敗:', error);
    
    // 根據錯誤類型提供不同的錯誤訊息
    let errorCode = 'unknown_error';
    if (error.response) {
      // LINE API 錯誤
      if (error.response.status === 400) {
        errorCode = 'invalid_line_code';
      } else if (error.response.status === 401) {
        errorCode = 'line_auth_failed';
      }
    } else if (error.message.includes('supabase')) {
      errorCode = 'supabase_error';
    }

    res.redirect(`${process.env.FRONTEND_URL}?error=${errorCode}`);
  }
});

// ===== 錯誤處理中間件 =====
app.use((err, req, res, next) => {
  console.error('未處理的錯誤:', err);
  res.status(500).json({ 
    error: '伺服器內部錯誤',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ===== 404 處理 =====
app.use((req, res) => {
  res.status(404).json({ 
    error: '找不到該路由',
    path: req.path 
  });
});

// ===== 啟動伺服器 =====
app.listen(PORT, () => {
  console.log('🚀 LINE Auth Proxy 啟動成功!');
  console.log(`📍 伺服器位址: http://localhost:${PORT}`);
  console.log(`🔗 LINE OAuth 入口: http://localhost:${PORT}/auth/line`);
  console.log(`📋 健康檢查: http://localhost:${PORT}/health`);
  console.log('---');
  console.log('🔧 環境變數檢查:');
  console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅' : '❌'}`);
  console.log(`   SERVICE_ROLE_KEY: ${process.env.SERVICE_ROLE_KEY ? '✅ (已設定)' : '❌'}`);
  console.log(`   LINE_CHANNEL_ID: ${process.env.LINE_CHANNEL_ID ? '✅' : '❌'}`);
  console.log(`   LINE_CHANNEL_SECRET: ${process.env.LINE_CHANNEL_SECRET ? '✅ (已設定)' : '❌'}`);
  console.log(`   LINE_REDIRECT_URI: ${process.env.LINE_REDIRECT_URI || '❌'}`);
  console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || '❌'}`);
});

// ===== 優雅關閉處理 =====
process.on('SIGTERM', () => {
  console.log('🔄 收到 SIGTERM 信號，正在關閉伺服器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 收到 SIGINT 信號，正在關閉伺服器...');
  process.exit(0);
});