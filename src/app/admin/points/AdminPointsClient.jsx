'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient.js'

export default function AdminPointsClient() {
  const [activeUsers, setActiveUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [amount, setAmount] = useState(500)

  useEffect(() => {
    loadActiveUsers()
    loadAllUsers()
  }, [])

  async function loadAllUsers() {
    try {
      // profiles 테이블에서 모든 사용자 조회
      const { data } = await supabase
        .from('profiles')
        .select('id, nickname, email')
        .order('created_at', { ascending: false })
        .limit(100)

      setAllUsers(data || [])
    } catch (err) {
      console.error('전체 사용자 조회 오류:', err)
    }
  }

  async function loadActiveUsers() {
    setLoading(true)
    try {
      // 최근 7일간 게시글/댓글을 작성한 활발한 사용자 조회
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: posts } = await supabase
        .from('posts')
        .select('author_id, nickname')
        .gte('created_at', sevenDaysAgo.toISOString())

      const { data: comments } = await supabase
        .from('comments')
        .select('author_id, nickname')
        .gte('created_at', sevenDaysAgo.toISOString())

      // 사용자별 활동 통계
      const userActivity = {}
      ;[...posts, ...comments].forEach(item => {
        if (!item.author_id) return
        if (!userActivity[item.author_id]) {
          userActivity[item.author_id] = {
            userId: item.author_id,
            nickname: item.nickname || '익명',
            posts: 0,
            comments: 0
          }
        }
        if (item.id && posts.some(p => p.id === item.id)) {
          userActivity[item.author_id].posts++
        } else {
          userActivity[item.author_id].comments++
        }
      })

      setActiveUsers(Object.values(userActivity))
    } catch (err) {
      console.error('활동 사용자 조회 오류:', err)
      setMessage('활동 사용자를 불러올 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAwardPoints(userId, nickname) {
    if (!confirm(`${nickname}님에게 ${amount}P를 지급하시겠습니까?`)) return

    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) {
        alert('로그인이 필요합니다.')
        return
      }

      // point_transactions 테이블에 직접 insert
      const { error } = await supabase
        .from('point_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          transaction_type: 'earned',
          reason: '관리자 지급',
          meta: { awarded_by: user.user.id }
        })

      if (error) throw error

      // user_points 테이블 업데이트
      const { error: updateError } = await supabase
        .rpc('update_user_points', { 
          p_user_id: userId, 
          p_amount: amount 
        })

      if (updateError) throw updateError

      setMessage(`✅ ${nickname}님에게 ${amount}P가 지급되었습니다.`)
      loadActiveUsers()
    } catch (err) {
      console.error('포인트 지급 오류:', err)
      setMessage('❌ 포인트 지급 중 오류: ' + err.message)
    }
  }

  if (loading) {
    return <div className="text-center py-8">활동 사용자를 불러오는 중...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">포인트 관리</h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h2 className="font-semibold text-yellow-800 mb-2">💡 관리자 기능</h2>
        <p className="text-sm text-yellow-700">
          사용자를 검색하거나 활발한 사용자 목록에서 포인트를 지급할 수 있습니다.
        </p>
      </div>

      {/* 사용자 검색 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-3">🔍 사용자 검색</h3>
        <input
          type="text"
          placeholder="닉네임 또는 이메일로 검색..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-3"
        />
        
        {searchQuery && (
          <div className="space-y-2">
            {allUsers
              .filter(user => 
                user.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .slice(0, 5)
              .map(user => (
                <div
                  key={user.id}
                  className="border rounded-lg p-3 flex items-center justify-between hover:bg-white"
                >
                  <div>
                    <div className="font-medium">{user.nickname || '익명'}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                  <button
                    onClick={() => handleAwardPoints(user.id, user.nickname || '익명')}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 active:scale-95"
                  >
                    {amount}P 지급
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">지급할 포인트:</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="border rounded px-3 py-1 w-32"
          min="1"
        />
        <span className="text-sm text-gray-600">P</span>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">
          활발한 사용자 ({activeUsers.length}명)
        </h2>

        {activeUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            최근 7일간 활동한 사용자가 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {activeUsers.map(user => (
              <div
                key={user.userId}
                className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div>
                  <div className="font-medium">{user.nickname}</div>
                  <div className="text-sm text-gray-600">
                    게시글 {user.posts}개 · 댓글 {user.comments}개
                  </div>
                </div>
                <button
                  onClick={() => handleAwardPoints(user.userId, user.nickname)}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 active:scale-95"
                >
                  {amount}P 지급
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
