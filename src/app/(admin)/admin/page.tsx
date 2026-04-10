import { Metadata } from 'next'

export const metadata: Metadata = { title: '관리자' }

export default function AdminPage() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold">관리자 대시보드</h1>
      <p className="text-muted-foreground mt-2">전체 플랫폼 현황</p>
    </div>
  )
}
