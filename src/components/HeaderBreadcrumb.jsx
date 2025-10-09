'use client'
import { useMemo } from 'react'
import { usePathname } from 'next/navigation'

const THEMES = {
  swimming:   { icon: '🏊', name: '수영',       text: 'text-blue-700',    bg: 'bg-blue-50'    },
  soccer:     { icon: '⚽', name: '축구',       text: 'text-gray-900',    bg: 'bg-gray-100'   }, // ⚫ 변경
  basketball: { icon: '🏀', name: '농구',       text: 'text-orange-700',  bg: 'bg-orange-50'  },
  baseball:   { icon: '⚾', name: '야구',       text: 'text-gray-700',    bg: 'bg-gray-50'    },
  tennis:     { icon: '🎾', name: '테니스',     text: 'text-lime-700',    bg: 'bg-lime-50'    },
  badminton:  { icon: '🏸', name: '배드민턴',   text: 'text-pink-700',    bg: 'bg-pink-50'    },
  crossfit:   { icon: '🏋️‍♀️', name: '크로스핏', text: 'text-amber-700',   bg: 'bg-amber-50'   },
  fitness:    { icon: '💪', name: '헬스·웨이트', text: 'text-brand-700',   bg: 'bg-brand-50'   },
  running:    { icon: '🏃', name: '러닝·마라톤', text: 'text-cyan-700',    bg: 'bg-cyan-50'    },
  climbing:   { icon: '🧗', name: '클라이밍',   text: 'text-purple-700',  bg: 'bg-purple-50'  },
}

export default function HeaderBreadcrumb() {
  const pathname = usePathname() || ''
  const parts = pathname.split('/').filter(Boolean)

  const info = useMemo(() => {
    if (parts[0] !== 'boards' || parts.length < 2) return null
    const slug = parts[1]
    const theme = THEMES[slug] || { icon: '🏅', name: `#${slug}`, text: 'text-gray-700', bg: 'bg-gray-50' }
    return { slug, ...theme }
  }, [parts])

  if (!info) return null

  return (
    <div className={`w-full ${info.bg} border-b`}>
      <div className="mx-auto max-w-5xl px-4 h-10 flex items-center gap-2">
        <span className={`text-xl ${info.text}`}>{info.icon}</span>
        <span className={`text-sm font-medium ${info.text}`}>{info.name}</span>
        <span className="text-xs text-gray-500">/boards/{info.slug}</span>
      </div>
    </div>
  )
}
