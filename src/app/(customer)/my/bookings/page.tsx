'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarDays, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  confirmed: { label: '예약확정', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  completed: { label: '이용완료', color: 'bg-green-50 text-green-600 border-green-200' },
  cancelled: { label: '취소됨', color: 'bg-gray-50 text-gray-500 border-gray-200' },
  noshow: { label: '노쇼', color: 'bg-red-50 text-red-500 border-red-200' },
  blocked: { label: '블록', color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
}

export default function MyBookingsPage() {
  const { user, isLoading } = useAuth()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('reservations')
        .select('*, shop:shops(name, address), designer:designers(name), menu:menus(name)')
        .eq('customer_id', user.id)
        .order('date', { ascending: false })
      setBookings(data || [])
      setLoading(false)
    }
    fetch()
  }, [user])

  if (isLoading || loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
        {[1,2,3].map(i => <Skeleton key={i} className="w-full h-32 rounded-2xl" />)}
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold">로그인이 필요합니다</h2>
        <Link href="/login?redirect=/my/bookings">
          <Button className="mt-4 bg-brand hover:bg-brand-dark text-white">로그인</Button>
        </Link>
      </div>
    )
  }

  const upcoming = bookings.filter(b => b.status === 'confirmed')
  const past = bookings.filter(b => b.status !== 'confirmed')

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">예약 내역</h1>

      <Tabs defaultValue="upcoming">
        <TabsList className="w-full">
          <TabsTrigger value="upcoming" className="flex-1">예정된 예약 ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past" className="flex-1">지난 예약 ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {upcoming.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">예정된 예약이 없습니다</p>
              <Link href="/search">
                <Button variant="outline" className="mt-3" size="sm">샵 찾아보기</Button>
              </Link>
            </div>
          ) : (
            upcoming.map(b => <BookingCard key={b.id} booking={b} />)
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-3">
          {past.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">지난 예약이 없습니다</p>
            </div>
          ) : (
            past.map(b => <BookingCard key={b.id} booking={b} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BookingCard({ booking }: { booking: any }) {
  const status = STATUS_MAP[booking.status] || STATUS_MAP.confirmed
  return (
    <div className="bg-white rounded-2xl border p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{booking.shop?.name ?? '알 수 없음'}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {booking.designer?.name} · {booking.menu?.name}
          </p>
        </div>
        <Badge variant="outline" className={status.color}>{status.label}</Badge>
      </div>
      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <CalendarDays className="w-3.5 h-3.5" />{booking.date}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />{booking.start_time} ~ {booking.end_time}
        </span>
      </div>
      {booking.total_price > 0 && (
        <div className="mt-3 pt-3 border-t">
          <span className="font-semibold">{booking.total_price.toLocaleString()}원</span>
        </div>
      )}
    </div>
  )
}
