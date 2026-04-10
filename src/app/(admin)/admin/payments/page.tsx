'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const METHOD_LABEL: Record<string, string> = { point3: 'Point3', card: '카드', portone: '포트원' }
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '대기', color: 'bg-amber-50 text-amber-600' },
  paid: { label: '결제완료', color: 'bg-green-50 text-green-600' },
  refunded: { label: '환불', color: 'bg-red-50 text-red-500' },
  failed: { label: '실패', color: 'bg-gray-50 text-gray-500' },
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('payments')
        .select('*, shop:shops(name), customer:users(name)')
        .order('created_at', { ascending: false })
        .limit(50)
      setPayments(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <div className="p-6 lg:p-8 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-2">결제 모니터링</h1>
      <p className="text-sm text-muted-foreground mb-8">최근 50건</p>

      {payments.length === 0 ? (
        <div className="text-center py-16"><CreditCard className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">결제 내역이 없습니다</p></div>
      ) : (
        <div className="space-y-2">
          {payments.map(p => {
            const status = STATUS_MAP[p.status] || STATUS_MAP.pending
            return (
              <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{p.customer?.name || '—'}</span>
                    <Badge variant="secondary" className="text-[10px]">{METHOD_LABEL[p.method] || p.method}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${status.color}`}>{status.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{p.shop?.name} · {p.created_at ? new Date(p.created_at).toLocaleDateString('ko') : ''}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">₩{p.amount?.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">수수료 ₩{p.fee_amount?.toLocaleString()}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
