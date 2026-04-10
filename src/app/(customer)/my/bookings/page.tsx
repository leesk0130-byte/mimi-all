'use client'

import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarDays, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'

// 데모 데이터 (Supabase 연동 전)
const DEMO_BOOKINGS = [
  {
    id: '1', shopName: '루미에르 헤어', designerName: '김수진 원장',
    menuName: '커트 + 셋팅', date: '2026-04-12', startTime: '14:00',
    endTime: '15:00', status: 'confirmed' as const, price: 45000,
    address: '강남구 신사동',
  },
  {
    id: '2', shopName: '젤리네일 스튜디오', designerName: '박예린',
    menuName: '젤네일 아트', date: '2026-04-08', startTime: '11:00',
    endTime: '12:30', status: 'completed' as const, price: 65000,
    address: '마포구 연남동',
  },
  {
    id: '3', shopName: '글로우 에스테틱', designerName: '이지은',
    menuName: '수분 관리', date: '2026-04-01', startTime: '16:00',
    endTime: '17:00', status: 'cancelled' as const, price: 80000,
    address: '서초구 반포동',
  },
]

const STATUS_MAP = {
  confirmed: { label: '예약확정', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  completed: { label: '이용완료', color: 'bg-green-50 text-green-600 border-green-200' },
  cancelled: { label: '취소됨', color: 'bg-gray-50 text-gray-500 border-gray-200' },
  noshow: { label: '노쇼', color: 'bg-red-50 text-red-500 border-red-200' },
  blocked: { label: '블록', color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
}

export default function MyBookingsPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
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

  const upcoming = DEMO_BOOKINGS.filter(b => b.status === 'confirmed')
  const past = DEMO_BOOKINGS.filter(b => b.status !== 'confirmed')

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">예약 내역</h1>

      <Tabs defaultValue="upcoming">
        <TabsList className="w-full">
          <TabsTrigger value="upcoming" className="flex-1">
            예정된 예약 ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex-1">
            지난 예약 ({past.length})
          </TabsTrigger>
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
            upcoming.map(booking => (
              <BookingCard key={booking.id} booking={booking} showActions />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-3">
          {past.map(booking => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BookingCard({
  booking,
  showActions,
}: {
  booking: typeof DEMO_BOOKINGS[0]
  showActions?: boolean
}) {
  const status = STATUS_MAP[booking.status]

  return (
    <div className="bg-white rounded-2xl border p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{booking.shopName}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{booking.designerName} · {booking.menuName}</p>
        </div>
        <Badge variant="outline" className={status.color}>{status.label}</Badge>
      </div>

      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <CalendarDays className="w-3.5 h-3.5" />
          {booking.date}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {booking.startTime} ~ {booking.endTime}
        </span>
      </div>

      <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
        <MapPin className="w-3 h-3" />
        {booking.address}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t">
        <span className="font-semibold">{booking.price.toLocaleString()}원</span>
        {showActions && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">예약 취소</Button>
            <Button size="sm" className="bg-brand hover:bg-brand-dark text-white">상세보기</Button>
          </div>
        )}
        {booking.status === 'completed' && (
          <Link href={`/my/reviews?booking=${booking.id}`}>
            <Button size="sm" variant="outline">리뷰 작성</Button>
          </Link>
        )}
      </div>
    </div>
  )
}
