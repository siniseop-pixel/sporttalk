'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient.js'
import PointBalance from './PointBalance.jsx'

export default function HeaderClient() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [nickname, setNickname] = useState(null)
  const [email, setEmail] = useState(null)
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const adminMenuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setShowAdminMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    async function fetchUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        setEmail(session.user.email)
        
        // profiles 테이블에서 닉네임 가져오기
        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', session.user.id)
          .single()
        
        if (profile?.nickname) {
          setNickname(profile.nickname)
        }
      } else {
        setUser(null)
        setNickname(null)
        setEmail(null)
      }
    }
    
    fetchUser()
    
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        setUser(session.user)
        setEmail(session.user.email)
        
        // profiles 테이블에서 닉네임 가져오기
        supabase
          .from('profiles')
          .select('nickname')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile?.nickname) {
              setNickname(profile.nickname)
            }
          })
      } else {
        setUser(null)
        setNickname(null)
        setEmail(null)
      }
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
      <a href="/boards/attendance" className="text-sm text-gray-900 no-underline">출석</a>
      <a href="/shop" className="text-sm text-gray-900 no-underline">상점</a>

      {user ? (
        <>
          <PointBalance />
          {(email?.includes('admin') || email === 'siniseop@naver.com') && (
            <div className="relative" ref={adminMenuRef}>
              <button
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="text-sm text-gray-900 no-underline hover:underline"
              >
                관리자 ▼
              </button>
              {showAdminMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2 z-50">
                  <a
                    href="/admin/points"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 no-underline"
                    onClick={() => setShowAdminMenu(false)}
                  >
                    포인트 관리
                  </a>
                  <a
                    href="/admin/shop"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 no-underline"
                    onClick={() => setShowAdminMenu(false)}
                  >
                    상점 관리
                  </a>
                </div>
              )}
            </div>
          )}
          <span className="text-xs md:text-sm text-gray-600">{nickname || email}</span>
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
