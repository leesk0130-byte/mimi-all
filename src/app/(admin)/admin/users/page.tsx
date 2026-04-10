import { Metadata } from 'next'

export const metadata: Metadata = { title: '사용자 관리' }

export default function AdminUsersPage() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold">사용자 관리</h1>
    </div>
  )
}
