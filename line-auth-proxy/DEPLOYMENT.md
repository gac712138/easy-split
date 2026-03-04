# LINE Auth Proxy Docker 整合部署指南

🚀 **完整的 Docker 整合方案已準備就緒！**

## 📁 **新增檔案清單**

```
line-auth-proxy/
├── Dockerfile                    # ✅ 已建立
├── docker-compose-example.yml    # ✅ 參考配置
├── kong-example.yml              # ✅ Kong 路由配置範例
└── ... (其他現有檔案)
```

## 🔧 **部署步驟**

### 1️⃣ **Docker 服務配置**
將 `docker-compose-example.yml` 中的 `auth-proxy` 服務區塊，添加到您的主要 `docker-compose.yml` 中：

```yaml
services:
  auth-proxy:
    build:
      context: ./line-auth-proxy
      dockerfile: Dockerfile
    container_name: supabase-auth-proxy
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      SUPABASE_URL: ${SUPABASE_PUBLIC_URL}
      SERVICE_ROLE_KEY: ${SERVICE_ROLE_KEY}
      LINE_CHANNEL_ID: ${GOTRUE_EXTERNAL_LINE_CLIENT_ID}
      LINE_CHANNEL_SECRET: ${GOTRUE_EXTERNAL_LINE_SECRET}
      LINE_REDIRECT_URI: "https://api-easysplit.island-dev.com/auth/line/callback"
      FRONTEND_URL: ${SITE_URL}
      PORT: 3001
      NODE_ENV: production
```

### 2️⃣ **清理原有 Auth 服務**
在您的 `auth` 服務環境變數中：

❌ **移除以下變數：**
```yaml
# 刪除這些
- GOTRUE_EXTERNAL_LINE_CLIENT_ID
- GOTRUE_EXTERNAL_LINE_SECRET  
- GOTRUE_EXTERNAL_LINE_ENABLED
```

✅ **修改 Provider 設定：**
```yaml
# 改為只包含 Google
GOTRUE_EXTERNAL_PROVIDERS: "google"
```

### 3️⃣ **Kong Gateway 路由設定**
將 `kong-example.yml` 中的服務和路由配置，添加到您的主要 Kong 配置中：

```yaml
services:
  - name: auth-proxy
    url: http://auth-proxy:3001

routes:
  - name: auth-proxy-route
    service: auth-proxy
    hosts:
      - api-easysplit.island-dev.com
    paths:
      - /auth/line
    strip_path: false
```

### 4️⃣ **環境變數設定**
確保您的主要 `.env` 檔案包含：

```env
# LINE OAuth 設定（新增）
GOTRUE_EXTERNAL_LINE_CLIENT_ID=your_line_channel_id
GOTRUE_EXTERNAL_LINE_SECRET=your_line_channel_secret

# 其他現有變數...
SUPABASE_PUBLIC_URL=https://api-easysplit.island-dev.com
SERVICE_ROLE_KEY=your_service_role_key
SITE_URL=https://easysplit.island-dev.com
```

## 🌟 **前端修改已完成**

✅ **LINE 按鈕** - 已修改為直接跳轉到 Kong Gateway
✅ **Google 按鈕** - 維持原有的 Supabase OAuth 流程
✅ **程式碼簡化** - 移除不必要的 LINE provider 處理

## 🚀 **啟動命令**

```bash
# 構建並啟動所有服務
docker-compose up -d --build

# 只重新構建 auth-proxy 服務
docker-compose up -d --build auth-proxy

# 查看 auth-proxy 日誌
docker-compose logs -f auth-proxy
```

## 🔍 **測試驗證**

1. **健康檢查：** `https://api-easysplit.island-dev.com/auth/line/health`
2. **LINE 登入：** `https://api-easysplit.island-dev.com/auth/line`
3. **前端測試：** 點擊 LINE 登入按鈕

## 📋 **檢查清單**

- [ ] 將 `auth-proxy` 服務添加到 `docker-compose.yml`
- [ ] 從 `auth` 服務移除 LINE 相關環境變數
- [ ] 更新 `kong.yml` 添加路由規則
- [ ] 設定 LINE Developers Console 的回調 URL
- [ ] 填入正確的環境變數值
- [ ] 執行 `docker-compose up -d --build`
- [ ] 測試 LINE 登入流程

## ⚠️ **注意事項**

1. **LINE Callback URL** 必須設為：`https://api-easysplit.island-dev.com/auth/line/callback`
2. **Service Role Key** 具有最高權限，請妥善保管
3. **防火牆設定** 確保 3001 端口在容器間可以通信
4. **SSL 憑證** 確保 Kong Gateway 的 HTTPS 配置正確

🎉 **整合完成！您的 EasySplit 現在支援完整的三方登入：Email + Google + LINE**