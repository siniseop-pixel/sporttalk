'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient.js'

export default function HeaderClient() {
  const router = useRouter()
  const [email, setEmail] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data?.session?.user?.email ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null)
      router.refresh()
    })
    return () => sub?.subscription?.unsubscribe()
  }, [router])

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/')
    router.refresh()
  }

  return (
    <nav className="flex items-center gap-3">
      <a href="/boards" className="text-sm text-gray-900 no-underline">Boards</a>

      {email ? (
        <>
          <span className="text-xs md:text-sm text-gray-600">{email}</span>
          <button
            onClick={signOut}
            className="text-sm rounded-md border px-3 py-1 bg-white active:scale-95"
          >
            로그아웃
          </button>
        </>
      ) : (
        <a href="/auth" className="text-sm text-gray-900 no-underline">Auth</a>
      )}
    </nav>
  )
}
