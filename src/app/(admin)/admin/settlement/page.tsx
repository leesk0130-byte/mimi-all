'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3, Store } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminSettlementPage() {
  const [shops, setShops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('shops').select('*').eq('status', 'approved').order('name')
      if (data) {
        const enriched = await Promise.all(data.map(async (shop) => {
          const { data: payments } = await supabase
            .from('payments')
            .select('amount, fee_amount, settlement_amount')
            .eq('shop_id', shop.id)
            .eq('status', 'paid')
          const totalSales = payments?.reduce((s, p) => s + p.amount, 0) || 0
          const totalFee = payments?.reduce((s, p) => s + p.fee_amount, 0) || 0
          const totalSettlement = payments?.reduce((s, p) => s + p.settlement_amount, 0) || 0
          return { ...shop, totalSales, totalFee, totalSettlement, paymentCount: payments?.length || 0 }
        }))
        setShops(enriched)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <div className="p-6 lg:p-8 space-y-4">{[1,2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>

  const totalPlatformFee = shops.reduce((s, sh) => s + sh.totalFee, 0)

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">정산 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">매장별 정산 현황</p>
        </div>
        <Card className="px-4 py-2">
          <p className="text-xs text-muted-foreground">플랫폼 총 수수료</p>
          <p className="text-lg font-bold text-brand">₩{totalPlatformFee.toLocaleString()}</p>
        </Card>
      </div>

      {shops.length === 0 ? (
        <div className="text-center py-16"><BarChart3 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">승인된 매장이 없습니다</p></div>
      ) : (
        <div className="space-y-3">
          {shops.map(shop => (
            <Card key={shop.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-muted-foreground" />
                      <h3 className="font-semibold">{shop.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">결제 {shop.paymentCount}건</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm">매출 <span className="font-bold">₩{shop.totalSales.toLocaleString()}</span></p>
                    <p className="text-xs text-muted-foreground">수수료 ₩{shop.totalFee.toLocaleString()} → 정산 ₩{shop.totalSettlement.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
