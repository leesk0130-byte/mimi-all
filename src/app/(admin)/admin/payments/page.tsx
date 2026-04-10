import { Metadata } from 'next'

export const metadata: Metadata = { title: '결제 모니터링' }

export default function AdminPaymentsPage() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold">결제 모니터링</h1>
    </div>
  )
}
