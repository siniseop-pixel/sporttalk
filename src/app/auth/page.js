'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userEmail, setUserEmail] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
  }, [])

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return alert(error.message)
    alert('회원가입 완료! 이메일 확인(Verify) 후 로그인하세요.')
  }

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return alert(error.message)
    const { data } = await supabase.auth.getUser()
    setUserEmail(data.user?.email ?? null)
    alert('로그인 성공!')
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUserEmail(null)
    alert('로그아웃 되었습니다.')
  }

  return (
    <main style={{ maxWidth: 400, margin: '40px auto', padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 'bold' }}>
        {userEmail ? `안녕하세요, ${userEmail}` : '로그인 / 회원가입'}
      </h1>

      {!userEmail && (
        <div style={{ display: 'grid', gap: 8, marginTop: 16 }}>
          <input
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ border: '1px solid #ccc', borderRadius: 8, padding: 10 }}
          />
          <input
            placeholder="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ border: '1px solid #ccc', borderRadius: 8, padding: 10 }}
          />
          <button onClick={signIn} style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }}>
            로그인
          </button>
          <button
            onClick={signUp}
            style={{ padding: 10, borderRadius: 8, background: '#059669', color: '#fff', border: 0 }}
          >
            회원가입
          </button>
        </div>
      )}

      {userEmail && (
        <button onClick={signOut} style={{ marginTop: 16, padding: 10, borderRadius: 8, border: '1px solid #ddd' }}>
          로그아웃
        </button>
      )}
    </main>
  )
}
