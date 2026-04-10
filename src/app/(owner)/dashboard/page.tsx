'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CalendarDays, Users, CreditCard, TrendingUp,
  Clock, CheckCircle2, XCircle, AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'

// 데모 통계
const STATS = [
  { label: '오늘 예약', value: '8건', icon: CalendarDays, color: 'text-blue-500 bg-blue-50', change: '+2' },
  { label: '이번 주 매출', value: '₩1,240,000', icon: CreditCard, color: 'text-green-500 bg-green-50', change: '+15%' },
  { label: '신규 고객', value: '12명', icon: Users, color: 'text-purple-500 bg-purple-50', change: '+4' },
  { label: '평균 평점', value: '4.8', icon: TrendingUp, color: 'text-amber-500 bg-amber-50', change: '+0.1' },
]

const TODAY_BOOKINGS = [
  { time: '10:00', customer: '김지연', menu: '커트 + 셋팅', designer: '김수진', status: 'confirmed' },
  { time: '11:30', customer: '이하은', menu: '염색 (전체)', designer: '박서윤', status: 'confirmed' },
  { time: '13:00', customer: '', menu: '', designer: '김수진', status: 'blocked', memo: '점심 휴식' },
  { time: '14:00', customer: '최민서', menu: '디지털 펌', designer: '김수진', status: 'confirmed' },
  { time: '15:00', customer: '네이버 박OO', menu: '커트', designer: '박서윤', status: 'confirmed' },
  { time: '16:30', customer: '정유진', menu: '클리닉', designer: '김수진', status: 'completed' },
]

const STATUS_ICON = {
  confirmed: <Clock className="w-4 h-4 text-blue-500" />,
  completed: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  cancelled: <XCircle className="w-4 h-4 text-gray-400" />,
  blocked: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  noshow: <XCircle className="w-4 h-4 text-red-500" />,
}

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-sm text-muted-foreground mt-1">루미에르 헤어 · 오늘의 현황</p>
        </div>
        <Link
          href="/dashboard/calendar"
          className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors"
        >
          예약 캘린더
        </Link>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(({ label, value, icon: Icon, color, change }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <Badge variant="secondary" className="text-[10px] text-green-600">{change}</Badge>
              </div>
              <p className="text-2xl font-bold mt-3">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 오늘 예약 리스트 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">오늘 예약 ({TODAY_BOOKINGS.length}건)</CardTitle>
            <Link href="/dashboard/calendar" className="text-sm text-brand hover:underline">전체보기</Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {TODAY_BOOKINGS.map((booking, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                  booking.status === 'blocked'
                    ? 'bg-amber-50/50'
                    : booking.status === 'completed'
                    ? 'bg-green-50/30'
                    : 'hover:bg-muted/50'
                }`}
              >
                <span className="text-sm font-mono font-medium w-12 shrink-0">{booking.time}</span>
                <div className="w-5 flex justify-center">
                  {STATUS_ICON[booking.status as keyof typeof STATUS_ICON]}
                </div>
                <div className="flex-1 min-w-0">
                  {booking.status === 'blocked' ? (
                    <p className="text-sm text-amber-600 font-medium">
                      블록 — {booking.memo}
                    </p>
                  ) : (
                    <>
                      <p className="text-sm font-medium truncate">{booking.customer}</p>
                      <p className="text-xs text-muted-foreground">{booking.menu}</p>
                    </>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{booking.designer}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
