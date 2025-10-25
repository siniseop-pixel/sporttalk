# iSports

스포츠 커뮤니티 플랫폼

## 환경 설정

1. `.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 설치 및 실행

### 개발 모드
```bash
npm install
npm run dev
```
서버가 http://localhost:3000 에서 실행됩니다.

### 프로덕션 모드 (배포)
```bash
# Windows
start_production.bat

# 또는 수동 실행
npm run build
npm run start
```

## 주요 기능

- 게시판 (골프, 배구, 사이클, 탁구, 동계스포츠 등)
- 출석 체크 (포인트 지급)
- 포인트 시스템
- 상점 (랜덤 박스 구매)
- 관리자 기능 (포인트 지급, 상점 아이템 관리)

## 기술 스택

- Next.js 15.5.4
- React 18.3.1
- Supabase
- Tailwind CSS
