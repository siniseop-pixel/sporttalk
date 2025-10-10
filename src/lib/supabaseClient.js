// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// ✅ 환경변수 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// ✅ 안전장치: 환경변수 누락 시 경고 (개발 환경만)
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '⚠️ Supabase 환경변수가 누락되었습니다. .env.local 파일을 확인하세요.\n' +
      'NEXT_PUBLIC_SUPABASE_URL 및 NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }
}

// ✅ 클라이언트 인스턴스 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,        // 브라우저에 세션 유지
    autoRefreshToken: true,      // 토큰 자동 갱신
  },
})

// ✅ 타입 안정성을 위해 기본 export는 금지 (명시적 import만)
export default supabase
