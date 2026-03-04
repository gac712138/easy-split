# LINE Auth Proxy for Supabase

🔗 **為自託管 Supabase 提供的 LINE OAuth 認證代理服務**

此服務作為 LINE OAuth 與 Supabase 之間的橋樑，解決自託管 Supabase 不直接支援 LINE 登入的問題。

## 🚀 功能特色

- ✅ 完整的 LINE OAuth 2.0 流程處理
- ✅ 自動建立/查找 Supabase 用戶
- ✅ 虛擬 Email 系統（`line_${userId}@easysplit.internal`）
- ✅ Magic Link 自動登入
- ✅ 完善的錯誤處理與日誌
- ✅ CORS 安全設定
- ✅ 優雅關閉支援

## 📋 環境需求

- Node.js 16.0.0 或以上
- 自託管的 Supabase 實例
- LINE Developers 帳號與 Channel

## 🔧 安裝與設定

### 1. 安裝依賴

```bash
npm install
```

### 2. 環境變數設定

複製 `.env.example` 為 `.env` 並填入正確的值：

```bash
cp .env.example .env
```

### 3. LINE Developers Console 設定

1. 前往 [LINE Developers Console](https://developers.line.biz/)
2. 建立新的 Channel 或使用現有的
3. 設定 Callback URL（重要！）：
   ```
   http://localhost:3001/auth/line/callback  # 開發環境
   https://your-domain.com/auth/line/callback  # 正式環境
   ```
4. 記錄 Channel ID 和 Channel Secret

### 4. Supabase 設定

確保你有：
- Supabase 專案的 URL
- Service Role Key（具有 Admin 權限）

## 🏃‍♂️ 執行服務

### 開發模式
```bash
npm run dev
```

### 正式模式
```bash
npm start
```

服務將在 `http://localhost:3001` 啟動

## 📡 API 端點

### `GET /health`
健康檢查端點
```
http://localhost:3001/health
```

### `GET /auth/line`
啟動 LINE OAuth 流程
```
http://localhost:3001/auth/line
```

### `GET /auth/line/callback`
LINE OAuth 回調處理（由 LINE 自動調用）

## 🔗 前端整合

在你的 React 應用中，將 LINE 登入按鈕指向代理服務：

```jsx
const handleLineLogin = () => {
  window.location.href = 'http://localhost:3001/auth/line';
};

<button onClick={handleLineLogin}>
  使用 LINE 登入
</button>
```

## 🛡️ 安全性考量

1. **Service Role Key 保護**：
   - 絕對不要將 Service Role Key 暴露在前端
   - 使用環境變數管理敏感資訊
   - 考慮使用 Docker Secrets 或其他安全存儲

2. **HTTPS 部署**：
   - 正式環境務必使用 HTTPS
   - 確保 LINE Callback URL 使用 HTTPS

3. **State 驗證**：
   - 自動處理 CSRF 攻擊防護
   - State 有時效性（10 分鐘）

## 🐳 Docker 部署

創建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

構建與執行：
```bash
docker build -t line-auth-proxy .
docker run -p 3001:3001 --env-file .env line-auth-proxy
```

## 🔍 故障排除

### 常見錯誤

1. **State 無效**：檢查時鐘同步與 LINE Callback URL
2. **Supabase 連線失敗**：驗證 URL 與 Service Role Key
3. **LINE API 錯誤**：確認 Channel ID/Secret 正確性

### 除錯模式

設定環境變數 `NODE_ENV=development` 可獲得更詳細的錯誤訊息。

## 📝 日誌格式

服務會輸出結構化日誌：
```
🔄 重定向到 LINE OAuth: https://access.line.me/oauth2/v2.1/authorize?...
✅ 成功取得 Access Token  
🆕 建立新用戶: line_U12345@easysplit.internal
✅ 成功產生 Magic Link
```

## 🤝 貢獻

歡迎提交 Issue 與 Pull Request！

## 📄 授權

MIT License