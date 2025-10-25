// src/components/PointBalance.jsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient.js'

export default function PointBalance() {
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    
    const fetchBalance = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData?.user) {
          setLoading(false)
          return
        }

        // 데이터베이스 테이블이 존재하지 않을 수 있으므로 안전하게 처리
        const { data, error } = await supabase
          .from('user_points')
          .select('balance')
          .eq('user_id', userData.user.id)
          .single()

        if (error) {
          // 테이블이 없거나 권한 문제인 경우 기본값 사용
          console.log('포인트 시스템이 아직 설정되지 않았습니다:', error.message)
          if (alive) {
            setBalance(0)
            setLoading(false)
          }
          return
        }

        if (alive) {
          setBalance(data?.balance ?? 0)
          setLoading(false)
        }
      } catch (error) {
        console.log('포인트 조회 중 오류 (정상):', error.message)
        if (alive) {
          setBalance(0)
          setLoading(false)
        }
      }
    }

    fetchBalance()

    return () => {
      alive = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>💰</span>
        <span>로딩 중...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
      <span>💰</span>
      <span>{balance.toLocaleString()}P</span>
    </div>
  )
}
