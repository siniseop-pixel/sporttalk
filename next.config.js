/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⚙️ Next.js 실험적 기능 (Supabase SDK 최적화용)
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },

  // 🖼️ Supabase Storage 이미지 로드 허용
  images: {
  remotePatterns: [
    { protocol: 'https', hostname: '**.supabase.co' },
    { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
  ],
  formats: ['image/avif', 'image/webp'],
},

  // ⚙️ (선택) 리액트 strict 모드 — 개발 시 경고 감지에 유용
  reactStrictMode: true,

  // ⚙️ (선택) 타입스크립트 무시 설정 — JS 프로젝트라면 그대로 둬도 됨
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
