// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// 환경변수 (브라우저 노출 OK: NEXT_PUBLIC_* 만 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 브라우저에서만 생성: 서버(프리렌더)에서는 null로 둬서 충돌 회피
const isBrowser = typeof window !== 'undefined'

let _client = null
if (isBrowser) {
  if (!supabaseUrl || !supabaseAnonKey) {
    // 개발 중에만 경고
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }
  } else {
    _client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  }
}

// 기존 코드 유지 호환: { supabase }로 import 하던 곳 그대로 동작
export const supabase = _client

// 함수형도 제공(원하면 사용할 수 있음)
export function getSupabaseClient() {
  return _client
}
