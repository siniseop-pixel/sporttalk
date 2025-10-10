import { supabase } from "../../lib/supabaseClient.js"

export default async function BoardsPage() {
  const { data: boards } = await supabase
    .from("boards")
    .select("*")
    .order("sort_index", { ascending: true })
    .order("name", { ascending: true })

  const themes = {
    swimming:   { icon: "🏊", bg: "bg-blue-50", text: "text-blue-700", hover: "hover:bg-blue-100" },
    soccer:     { icon: "⚽", bg: "bg-gray-100", text: "text-gray-900", hover: "hover:bg-gray-200" },
    basketball: { icon: "🏀", bg: "bg-orange-50", text: "text-orange-700", hover: "hover:bg-orange-100" },
    baseball:   { icon: "⚾", bg: "bg-gray-50", text: "text-gray-700", hover: "hover:bg-gray-100" },
    tennis:     { icon: "🎾", bg: "bg-lime-50", text: "text-lime-700", hover: "hover:bg-lime-100" },
    badminton:  { icon: "🏸", bg: "bg-pink-50", text: "text-pink-700", hover: "hover:bg-pink-100" },
    crossfit:   { icon: "🏋️‍♀️", bg: "bg-amber-50", text: "text-amber-700", hover: "hover:bg-amber-100" },
    fitness:    { icon: "💪", bg: "bg-brand-50", text: "text-brand-700", hover: "hover:bg-brand-100" },
    running:    { icon: "🏃", bg: "bg-cyan-50", text: "text-cyan-700", hover: "hover:bg-cyan-100" },
    climbing:   { icon: "🧗", bg: "bg-purple-50", text: "text-purple-700", hover: "hover:bg-purple-100" },
  }

  return (
    <div>
      <h1 className="text-xl md:text-2xl font-bold text-brand-700">생활체육 커뮤니티</h1>
      <p className="text-gray-600 mt-1 text-sm md:text-base">관심 있는 종목을 선택하세요 🌿</p>

      <div className="grid gap-3 md:gap-4 mt-4 md:mt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {(boards || []).map((b) => {
          const t = themes[b.slug] || { icon: "🏅", bg: "bg-gray-50", text: "text-gray-700", hover: "hover:bg-gray-100" }
          return (
            <a
              key={b.id}
              href={`/boards/${b.slug}`}
              className={`card ${t.bg} ${t.hover} transition flex items-center gap-3 md:gap-4 p-3 md:p-4 active:scale-[0.99]`}
            >
              <div className={`text-2xl md:text-3xl ${t.text}`}>{t.icon}</div>
              <div className="min-w-0">
                <div className={`font-semibold text-base md:text-lg truncate ${t.text}`}>{b.name}</div>
                <div className="text-[11px] md:text-xs text-gray-500 truncate">#{b.slug}</div>
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}
