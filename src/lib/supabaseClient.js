import { createClient } from '@supabase/supabase-js'

// 使用 Vite 的環境變數讀取方式
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 初始化 Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)