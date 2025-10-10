import Image from 'next/image'

/**
 * 반응형 게시글 이미지 그리드
 * - urls: 문자열 URL 배열 (필수)
 * - colsSm / colsMd: 작은/중간 화면 컬럼 수 (기본 2 / 3)
 * - aspect: 컨테이너 비율 높이 (Tailwind h-40 처럼 고정 높이) 또는 'square' 등
 * - className: 외부에서 여백 등 추가
 */
export default function PostImageGrid({
  urls = [],
  colsSm = 2,
  colsMd = 3,
  aspect = 'h-40',
  className = '',
}) {
  if (!Array.isArray(urls) || urls.length === 0) return null

  // Tailwind 그리드 컬럼 유틸
  const gridCols = `grid grid-cols-2 md:grid-cols-${colsMd} gap-2 ${className}`
  const itemClass = `relative w-full ${aspect}` // e.g., h-40

  return (
    <div className={gridCols}>
      {urls.map((u, i) => (
        <div key={`${u}-${i}`} className={itemClass}>
          <Image
            src={u}
            alt={`post-image-${i + 1}`}
            fill
            className="object-cover rounded-xl border"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={i === 0}
          />
        </div>
      ))}
    </div>
  )
}
