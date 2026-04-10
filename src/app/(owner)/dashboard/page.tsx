'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CalendarDays, Users, CreditCard, TrendingUp,
  Clock, CheckCircle2, XCircle, AlertTriangle, Store,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const { user } = useAuth()
  const [shop, setShop] = useState<any>(null)
  const [todayBookings, setTodayBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const supabase = createClient()
      const { data: shopData } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (shopData) {
        setShop(shopData)
        const today = new Date().toISOString().split('T')[0]
        const { data: bookings } = await supabase
          .from('reservations')
          .select('*, designer:designers(name), menu:menus(name)')
          .eq('shop_id', shopData.id)
          .eq('date', today)
          .order('start_time')
        setTodayBookings(bookings || [])
      }
      setLoading(false)
    }
    fetch()
  }, [user])

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl space-y-6">
        <Skeleton className="w-48 h-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl">
        <div className="text-center py-20">
          <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold">아직 등록된 매장이 없습니다</h2>
          <p className="text-muted-foreground mt-2 text-sm">샵 정보를 먼저 등록해주세요</p>
          <Link
            href="/dashboard/shop"
            className="inline-flex items-center mt-6 px-6 py-3 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark transition-colors"
          >
            샵 등록하기
          </Link>
        </div>
      </div>
    )
  }

  const STATUS_ICON: Record<string, React.ReactNode> = {
    confirmed: <Clock className="w-4 h-4 text-blue-500" />,
    completed: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    cancelled: <XCircle className="w-4 h-4 text-gray-400" />,
    blocked: <AlertTriangle className="w-4 h-4 text-amber-500" />,
    noshow: <XCircle className="w-4 h-4 text-red-500" />,
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-sm text-muted-foreground mt-1">{shop.name} · 오늘의 현황</p>
        </div>
        <Link
          href="/dashboard/calendar"
          className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors"
        >
          예약 캘린더
        </Link>
      </div>

      {/* 오늘 예약 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">오늘 예약 ({todayBookings.length}건)</CardTitle>
        </CardHeader>
        <CardContent>
          {todayBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">오늘 예약이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-1">
              {todayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                    booking.status === 'blocked' ? 'bg-amber-50/50' :
                    booking.status === 'completed' ? 'bg-green-50/30' :
                    'hover:bg-muted/50'
                  }`}
                >
                  <span className="text-sm font-mono font-medium w-12 shrink-0">{booking.start_time?.slice(0,5)}</span>
                  <div className="w-5 flex justify-center">
                    {STATUS_ICON[booking.status] ?? STATUS_ICON.confirmed}
                  </div>
                  <div className="flex-1 min-w-0">
                    {booking.status === 'blocked' ? (
                      <p className="text-sm text-amber-600 font-medium">블록 — {booking.block_memo || '예약 불가'}</p>
                    ) : (
                      <>
                        <p className="text-sm font-medium truncate">{booking.customer_name || '미미올 고객'}</p>
                        <p className="text-xs text-muted-foreground">{booking.menu?.name}</p>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{booking.designer?.name}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
