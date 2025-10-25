'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient.js'

export default function AuthPage() {
  const sp = useSearchParams()
  const [mode, setMode] = useState(sp.get('mode') === 'signup' ? 'signup' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 이미 로그인 되어 있으면 홈으로
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/')
    })
  }, [router])

  async function onSubmit(e) {
    e.preventDefault()
    setMessage('')
    setBusy(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setMessage('✅ 로그인 성공!')
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 500)
        return
      }
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('✅ 회원가입 성공! 이메일 인증(설정 시)을 확인하세요.')
      }
    } catch (err) {
      setMessage('❌ ' + err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 card mt-10 grid gap-4">
      <h1 className="text-2xl font-bold text-center">로그인 / 회원가입</h1>

      <div className="flex justify-center gap-2">
        <button
          onClick={() => setMode('login')}
          className={`px-3 py-1 rounded ${mode==='login'?'bg-black text-white':'border'}`}
        >로그인</button>
        <button
          onClick={() => setMode('signup')}
          className={`px-3 py-1 rounded ${mode==='signup'?'bg-black text-white':'border'}`}
        >회원가입</button>
      </div>

      <form onSubmit={onSubmit} className="grid gap-3">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          required
          className="border rounded p-2"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={e=>setPassword(e.target.value)}
          required
          className="border rounded p-2"
        />
        <button disabled={busy} className="bg-black text-white rounded py-2 active:scale-95">
          {mode === 'login' ? '로그인' : '회원가입'}
        </button>
      </form>

      {message && <p className="text-sm text-center text-gray-700">{message}</p>}
    </main>
  )
}
