'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Store, Check, X, MapPin, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '승인 대기', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  approved: { label: '승인됨', color: 'bg-green-50 text-green-600 border-green-200' },
  rejected: { label: '반려됨', color: 'bg-red-50 text-red-500 border-red-200' },
  suspended: { label: '정지됨', color: 'bg-gray-50 text-gray-500 border-gray-200' },
}

const CAT_LABEL: Record<string, string> = {
  hair: '헤어', nail: '네일', skin: '피부관리', lash: '속눈썹',
  barber: '바버', waxing: '왁싱', makeup: '메이크업',
}

export default function AdminShopsPage() {
  const [shops, setShops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchShops = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('shops').select('*, owner:users(name, email)').order('created_at', { ascending: false })
    setShops(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchShops() }, [])

  const updateStatus = async (shopId: string, status: string) => {
    const supabase = createClient()
    await supabase.from('shops').update({ status }).eq('id', shopId)
    toast.success(status === 'approved' ? '승인되었습니다.' : '반려되었습니다.')
    fetchShops()
  }

  if (loading) return <div className="p-6 lg:p-8 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>

  const pending = shops.filter(s => s.status === 'pending')
  const approved = shops.filter(s => s.status === 'approved')
  const others = shops.filter(s => s.status !== 'pending' && s.status !== 'approved')

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-8">입점 관리</h1>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">승인 대기 ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">승인됨 ({approved.length})</TabsTrigger>
          <TabsTrigger value="others">기타 ({others.length})</TabsTrigger>
        </TabsList>

        {['pending', 'approved', 'others'].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-4 space-y-3">
            {(tab === 'pending' ? pending : tab === 'approved' ? approved : others).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Store className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">해당하는 매장이 없습니다</p>
              </div>
            ) : (
              (tab === 'pending' ? pending : tab === 'approved' ? approved : others).map(shop => (
                <Card key={shop.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{shop.name}</h3>
                          <Badge variant="secondary" className="text-[10px]">{CAT_LABEL[shop.category] ?? shop.category}</Badge>
                          <Badge variant="outline" className={STATUS_MAP[shop.status]?.color}>{STATUS_MAP[shop.status]?.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{shop.address}</p>
                        <p className="text-xs text-muted-foreground mt-1">사장님: {shop.owner?.name} ({shop.owner?.email})</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Clock className="w-3 h-3" />{new Date(shop.created_at).toLocaleDateString('ko')} 등록</p>
                      </div>
                      {shop.status === 'pending' && (
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateStatus(shop.id, 'approved')}>
                            <Check className="w-4 h-4 mr-1" /> 승인
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => updateStatus(shop.id, 'rejected')}>
                            <X className="w-4 h-4 mr-1" /> 반려
                          </Button>
                        </div>
                      )}
                      {shop.status === 'approved' && (
                        <Button size="sm" variant="outline" className="text-destructive ml-4" onClick={() => updateStatus(shop.id, 'suspended')}>정지</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
