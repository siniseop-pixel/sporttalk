'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient.js'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setMessage('✅ 로그인 성공! 메인으로 이동 중...')
        location.href = '/'
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('✅ 회원가입 성공! 이메일 인증을 확인하세요.')
      } else if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({ email })
        if (error) throw error
        setMessage('📩 로그인 링크를 이메일로 보냈습니다.')
      }
    } catch (err) {
      setMessage('❌ ' + err.message)
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 card mt-10">
      <h1 className="text-2xl font-bold text-center mb-4">로그인 / 회원가입</h1>

      <div className="flex justify-center gap-2 mb-4">
        <button onClick={() => setMode('login')} className={`px-3 py-1 rounded ${mode==='login'?'bg-black text-white':'border'}`}>
          로그인
        </button>
        <button onClick={() => setMode('signup')} className={`px-3 py-1 rounded ${mode==='signup'?'bg-black text-white':'border'}`}>
          회원가입
        </button>
        <button onClick={() => setMode('magic')} className={`px-3 py-1 rounded ${mode==='magic'?'bg-black text-white':'border'}`}>
          링크 로그인
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="border rounded p-2"
        />
        {mode !== 'magic' && (
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="border rounded p-2"
          />
        )}

        <button className="bg-black text-white rounded py-2">
          {mode === 'login' && '로그인'}
          {mode === 'signup' && '회원가입'}
          {mode === 'magic' && '링크 받기'}
        </button>
      </form>

      {message && <p className="mt-3 text-sm text-center text-gray-700">{message}</p>}
    </main>
  )
}
