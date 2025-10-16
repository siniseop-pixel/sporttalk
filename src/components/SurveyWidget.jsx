'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient.js'

export default function SurveyWidget() {
  const [survey, setSurvey] = useState(null)
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      try {
        // 열려있는 최신 설문 1개
        const { data: s, error: e1 } = await supabase
          .from('surveys')
          .select('*')
          .eq('closed', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (e1) throw e1
        if (!alive) return

        setSurvey(s ?? null)

        if (s) {
          // 해당 설문의 보기들
          const { data: o, error: e2 } = await supabase
            .from('survey_options')
            .select('*')
            .eq('survey_id', s.id)
            .order('created_at', { ascending: true })
          if (e2) throw e2
          if (alive) setOptions(o ?? [])
        }
      } catch (err) {
        console.error('SurveyWidget error:', err?.message || err)
      } finally {
        if (alive) setLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [])

  async function vote(optId) {
    try {
      if (busy) return
      setBusy(true)

      // 1) 로그인 확인 (RLS가 authenticated만 insert 허용)
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        alert('로그인이 필요합니다.')
        return
      }

      // 2) RPC 호출 — uuid는 절대 Number(...)로 바꾸지 마세요
      const { error } = await supabase.rpc('answer_survey', {
        p_survey: survey.id, // uuid string
        p_option: optId,     // uuid string
      })
      if (error) throw error

      alert('응답이 저장되었어요! (포인트 +5)')
      // (선택) 투표 후 UI 재조회가 필요하면 아래 주석 해제
      // await reloadOptionsOrResults()
    } catch (err) {
      const msg = String(err?.message || '')
      const code = String(err?.code || '')
      if (msg.includes('duplicate') || code === '23505') {
        alert('이미 참여한 설문입니다.')
      } else {
        alert('투표 실패: ' + (err?.message || err))
      }
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-500">📊 설문을 불러오는 중...</div>
  }
  if (!survey) return null

  return (
    <div className="card p-3">
      <div className="font-semibold mb-2">📊 설문: {survey.title}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => vote(o.id)}
            disabled={busy}
            className="px-3 py-1 rounded-xl border hover:bg-gray-50 text-sm active:scale-95 disabled:opacity-60"
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
