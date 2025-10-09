'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export default function SurveyWidget() {
  const [survey, setSurvey] = useState(null)
  const [options, setOptions] = useState([])

  useEffect(() => {
    ;(async ()=>{
      const { data: s } = await sb.from('surveys').select('*').eq('closed', false).order('created_at',{ascending:false}).limit(1).maybeSingle()
      setSurvey(s||null)
      if (s) {
        const { data: o } = await sb.from('survey_options').select('*').eq('survey_id', s.id)
        setOptions(o||[])
      }
    })()
  }, [])

  if (!survey) return null

  async function vote(optId){
    await sb.rpc('answer_survey', { p_survey: survey.id, p_option: optId })
    alert('응답이 저장되었어요! (포인트 +5)')
  }

  return (
    <div className="card p-3">
      <div className="font-semibold mb-2">📊 설문: {survey.title}</div>
      <div className="flex flex-wrap gap-2">
        {options.map(o=>(
          <button key={o.id} onClick={()=>vote(o.id)}
            className="px-3 py-1 rounded-xl border hover:bg-gray-50 text-sm">
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
