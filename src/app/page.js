import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/boards')   // 홈 접속 시 /boards로 이동
}