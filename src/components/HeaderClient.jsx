'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function HeaderClient() {
  const router = useRouter()
  const [email, setEmail] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null)
      router.refresh()
    })
    return () => sub.subscription.unsubscribe()
  }, [router])

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/')
    router.refresh()
  }

  return (
    <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <a href="/boards" style={{ textDecoration: 'none', color: '#111' }}>Boards</a>
      {email ? (
        <>
          <span style={{ fontSize: 13, color: '#555' }}>{email}</span>
          <button onClick={signOut}
            style={{ padding:'6px 10px', borderRadius:8, border:'1px solid #ddd', background:'#fff', cursor:'pointer' }}>
            로그아웃
          </button>
        </>
      ) : (
        <a href="/auth" style={{ textDecoration: 'none', color: '#111' }}>Auth</a>
      )}
    </nav>
  )
}
