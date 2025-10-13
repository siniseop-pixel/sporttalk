'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient.js'

export default function SurveyWidget() {
  const [survey, setSurvey] = useState(null)
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
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
          const { data: o, error: e2 } = await supabase
            .from('survey_options')
            .select('*')
            .eq('survey_id', s.id)
          if (e2) throw e2
          if (alive) setOptions(o ?? [])
        }
      } catch (err) {
        console.error('SurveyWidget error:', err.message)
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
      const { error } = await supabase.rpc('answer_survey', {
        p_survey: survey.id,
        p_option: optId,
      })
      if (error) throw error
      alert('응답이 저장되었어요! (포인트 +5)')
    } catch (err) {
      alert('투표 실패: ' + err.message)
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
            className="px-3 py-1 rounded-xl border hover:bg-gray-50 text-sm active:scale-95"
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
