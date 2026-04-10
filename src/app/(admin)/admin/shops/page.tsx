import { Metadata } from 'next'

export const metadata: Metadata = { title: '입점 관리' }

export default function AdminShopsPage() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold">입점 관리</h1>
      <p className="text-muted-foreground mt-2">입점 신청 승인/반려</p>
    </div>
  )
}
