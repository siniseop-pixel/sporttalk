import { supabase } from '../../../../lib/supabaseClient.js'
import WriteForm from '../../../../components/WriteForm.jsx'
export const revalidate = 0

export default async function WritePage({ params:{ slug } }) {
  const { data: board } = await supabase.from('boards').select('id,name,slug').eq('slug', slug).single()
  if (!board) return <main className="p-4">보드를 찾을 수 없어요.</main>
  return (
    <main className="max-w-3xl mx-auto p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold">{board.name} 글쓰기</h1>
      <WriteForm boardId={board.id} slug={slug}/>
    </main>
  )
}
