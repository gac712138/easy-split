import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 診斷日誌保留，確認環境變數有抓到
console.log('--- Supabase Init Check ---')
console.log('URL:', supabaseUrl)
console.log('Key Length:', supabaseAnonKey?.length)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,   // 確保登入狀態存在瀏覽器
    autoRefreshToken: true, // 自動更新 Token
    detectSessionInUrl: true,
    // 設定預設重定向 URL
    redirectTo: import.meta.env.VITE_REDIRECT_URL || window.location.origin
  }
})