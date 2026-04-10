'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CreditCard, TrendingUp, TrendingDown, Banknote,
  ArrowUpRight, Calendar,
} from 'lucide-react'

const MONTHLY_STATS = {
  totalSales: 4850000,
  totalFee: 14550,
  totalSettlement: 4835450,
  paymentCount: 87,
  avgTicket: 55747,
  growth: 12.3,
}

const RECENT_PAYMENTS = [
  { id: '1', date: '2026-04-10', customer: '김지연', menu: '커트 + 셋팅', amount: 45000, fee: 135, method: 'point3' as const },
  { id: '2', date: '2026-04-10', customer: '이하은', menu: '전체 염색', amount: 80000, fee: 240, method: 'point3' as const },
  { id: '3', date: '2026-04-09', customer: '최민서', menu: '디지털 펌', amount: 100000, fee: 300, method: 'point3' as const },
  { id: '4', date: '2026-04-09', customer: '정유진', menu: '두피 클리닉', amount: 40000, fee: 120, method: 'card' as const },
  { id: '5', date: '2026-04-08', customer: '박서연', menu: '남성 커트', amount: 20000, fee: 60, method: 'point3' as const },
]

const METHOD_LABEL = { point3: 'Point3', card: '카드', portone: '포트원' }

export default function SettlementPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">매출/정산</h1>
          <p className="text-sm text-muted-foreground mt-1">
            <Calendar className="w-3.5 h-3.5 inline mr-1" />
            2026년 4월
          </p>
        </div>
        <Badge className="bg-green-50 text-green-600 border-green-200">
          <TrendingUp className="w-3 h-3 mr-1" />
          +{MONTHLY_STATS.growth}%
        </Badge>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">₩{(MONTHLY_STATS.totalSales / 10000).toFixed(0)}만</p>
            <p className="text-xs text-muted-foreground mt-1">총 매출</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold">₩{MONTHLY_STATS.totalFee.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">수수료 (0.3%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
              <Banknote className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold">₩{(MONTHLY_STATS.totalSettlement / 10000).toFixed(0)}만</p>
            <p className="text-xs text-muted-foreground mt-1">정산 예정</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
              <ArrowUpRight className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold">{MONTHLY_STATS.paymentCount}건</p>
            <p className="text-xs text-muted-foreground mt-1">결제 건수</p>
          </CardContent>
        </Card>
      </div>

      {/* 매출 바 그래프 (순수 CSS) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">일별 매출 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-40">
            {[65, 48, 72, 55, 80, 90, 45, 68, 75, 85].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-brand/20 rounded-t-sm hover:bg-brand/40 transition-colors"
                  style={{ height: `${v}%` }}
                />
                <span className="text-[9px] text-muted-foreground">{i + 1}일</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 최근 결제 내역 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">최근 결제 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {RECENT_PAYMENTS.map(payment => (
              <div key={payment.id} className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{payment.customer}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {METHOD_LABEL[payment.method]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{payment.menu} · {payment.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">₩{payment.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">수수료 ₩{payment.fee.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
