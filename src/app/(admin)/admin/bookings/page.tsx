'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  confirmed: { label: '확정', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  completed: { label: '완료', color: 'bg-green-50 text-green-600 border-green-200' },
  cancelled: { label: '취소', color: 'bg-gray-50 text-gray-500 border-gray-200' },
  noshow: { label: '노쇼', color: 'bg-red-50 text-red-500 border-red-200' },
  blocked: { label: '블록', color: 'bg-amber-50 text-amber-600 border-amber-200' },
}

export default function AdminBookingsPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('reservations')
        .select('*, shop:shops(name), designer:designers(name), menu:menus(name), customer:users(name)')
        .order('created_at', { ascending: false })
        .limit(50)
      setReservations(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <div className="p-6 lg:p-8 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-2">예약 모니터링</h1>
      <p className="text-sm text-muted-foreground mb-8">최근 50건</p>

      {reservations.length === 0 ? (
        <div className="text-center py-16"><CalendarDays className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">예약이 없습니다</p></div>
      ) : (
        <div className="space-y-2">
          {reservations.map(r => {
            const status = STATUS_MAP[r.status] || STATUS_MAP.confirmed
            return (
              <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{r.shop?.name}</span>
                    <Badge variant="outline" className={`text-[10px] ${status.color}`}>{status.label}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{r.source}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {r.customer?.name || r.customer_name || '—'} · {r.designer?.name} · {r.menu?.name || r.block_memo || '—'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium flex items-center gap-1"><CalendarDays className="w-3 h-3" />{r.date}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{r.start_time?.slice(0,5)} ~ {r.end_time?.slice(0,5)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
