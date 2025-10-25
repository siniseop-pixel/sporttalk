// src/app/boards/attendance/AttendanceForm.jsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient.js'

export default function AttendanceForm({ onSuccess }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleAttendance() {
    if (loading) return
    
    setLoading(true)
    try {
      // 로그인 확인
      const { data: u } = await supabase.auth.getUser()
      const user = u?.user
      if (!user) throw new Error('로그인이 필요합니다.')

      // 오늘 이미 출석했는지 확인
      const today = new Date().toISOString().split('T')[0]
      const { data: existingAttendance } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('user_id', user.id)
        .eq('attendance_date', today)
        .single()

      if (existingAttendance) {
        alert('이미 오늘 출석했습니다!')
        return
      }

      // 출석 게시글 생성
      const attendanceTitle = `출석체크 - ${new Date().toLocaleDateString()}`
      const attendanceBody = message.trim() || '오늘도 화이팅! 💪'

      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          slug: 'attendance',
          author_id: user.id,
          nickname: user.email ?? null,
          title: attendanceTitle,
          body: attendanceBody,
        })
        .select('id')
        .single()

      if (postError) throw postError

      // 출석 처리 및 포인트 지급
      const { data: attendanceResult, error: attendanceError } = await supabase
        .rpc('process_attendance', {
          user_uuid: user.id,
          post_uuid: postData.id
        })

      if (attendanceError) throw attendanceError

      if (attendanceResult.success) {
        alert(`출석 완료! ${attendanceResult.points_earned}P 획득! (연속 출석: ${attendanceResult.streak_count}일)`)
        
        // 새 게시글을 목록에 추가
        const { data: newPost } = await supabase
          .from('posts')
          .select(`
            id, slug, title, nickname, author_id, created_at, is_pinned,
            like_count, upvote_count, view_count,
            comments:comments(count)
          `)
          .eq('id', postData.id)
          .single()

        if (newPost) {
          onSuccess(newPost)
        }

        setMessage('')
        router.refresh()
      } else {
        alert(attendanceResult.message)
      }

    } catch (error) {
      console.error('출석 처리 오류:', error)
      alert('출석 처리 중 오류가 발생했습니다: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border p-4 bg-blue-50">
      <h3 className="font-semibold mb-3 text-blue-800">📅 오늘의 출석체크</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            출석 메시지 (선택사항)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="오늘의 다짐이나 인사를 남겨보세요!"
            className="w-full p-2 border rounded-md resize-none"
            rows={2}
            maxLength={200}
          />
        </div>
        
        <button
          onClick={handleAttendance}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '처리 중...' : '출석하기 (100P 획득)'}
        </button>
        
        <div className="text-xs text-gray-600">
          💡 팁: 7일 연속 출석 시 추가 300P 보너스를 받을 수 있습니다!
        </div>
      </div>
    </div>
  )
}

