'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { CreditCard, TrendingDown, Banknote, ArrowUpRight, Calendar, BarChart3 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

export default function SettlementPage() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const supabase = createClient()
      const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
      if (shop) {
        const { data } = await supabase
          .from('payments')
          .select('*, reservation:reservations(customer_name), customer:users(name)')
          .eq('shop_id', shop.id)
          .eq('status', 'paid')
          .order('paid_at', { ascending: false })
          .limit(20)
        setPayments(data || [])
      }
      setLoading(false)
    }
    fetch()
  }, [user])

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      </div>
    )
  }

  const totalSales = payments.reduce((s, p) => s + p.amount, 0)
  const totalFee = payments.reduce((s, p) => s + p.fee_amount, 0)
  const totalSettlement = payments.reduce((s, p) => s + p.settlement_amount, 0)

  const METHOD_LABEL: Record<string, string> = { point3: 'Point3', card: '카드', portone: '포트원' }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">매출/정산</h1>
          <p className="text-sm text-muted-foreground mt-1"><Calendar className="w-3.5 h-3.5 inline mr-1" />전체 기간</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3"><CreditCard className="w-5 h-5 text-blue-500" /></div>
            <p className="text-2xl font-bold">{totalSales > 0 ? `₩${(totalSales / 10000).toFixed(0)}만` : '₩0'}</p>
            <p className="text-xs text-muted-foreground mt-1">총 매출</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3"><TrendingDown className="w-5 h-5 text-red-500" /></div>
            <p className="text-2xl font-bold">₩{totalFee.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">수수료 (0.3%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3"><Banknote className="w-5 h-5 text-green-500" /></div>
            <p className="text-2xl font-bold">{totalSettlement > 0 ? `₩${(totalSettlement / 10000).toFixed(0)}만` : '₩0'}</p>
            <p className="text-xs text-muted-foreground mt-1">정산 예정</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3"><ArrowUpRight className="w-5 h-5 text-purple-500" /></div>
            <p className="text-2xl font-bold">{payments.length}건</p>
            <p className="text-xs text-muted-foreground mt-1">결제 건수</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">결제 내역</CardTitle></CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">아직 결제 내역이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-1">
              {payments.map(p => (
                <div key={p.id} className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{p.customer?.name || p.reservation?.customer_name || '고객'}</span>
                      <Badge variant="secondary" className="text-[10px]">{METHOD_LABEL[p.method] || p.method}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.paid_at ? new Date(p.paid_at).toLocaleDateString('ko') : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">₩{p.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">수수료 ₩{p.fee_amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
