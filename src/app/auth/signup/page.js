'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient.js'

export default function Signup() {
  const [email, setEmail] = useState('')
  async function onSignup(e){ e.preventDefault()
    await supabase.auth.signInWithOtp({ email })
    alert('가입/로그인 링크를 이메일로 보냈어요.')
  }
  return (
    <form onSubmit={onSignup} className="max-w-sm mx-auto bg-white p-6 rounded-2xl shadow space-y-3">
      <h2 className="text-xl font-bold">회원가입</h2>
      <input className="w-full border rounded p-2" placeholder="이메일" value={email} onChange={e=>setEmail(e.target.value)} />
      <button className="w-full rounded p-2 bg-black text-white">메일로 링크 받기</button>
    </form>
  )
}
