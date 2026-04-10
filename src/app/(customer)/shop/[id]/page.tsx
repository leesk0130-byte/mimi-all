'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Star, MapPin, Phone, Clock, Heart,
  Share2, Calendar, ArrowLeft,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Shop, Designer, Menu, Review } from '@/types'

const CAT_LABEL: Record<string, string> = {
  hair: '헤어샵', nail: '네일샵', skin: '피부관리',
  lash: '속눈썹', barber: '바버샵', waxing: '왁싱', makeup: '메이크업',
}

export default function ShopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [shop, setShop] = useState<Shop | null>(null)
  const [designers, setDesigners] = useState<Designer[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const [shopRes, designerRes, menuRes, reviewRes] = await Promise.all([
        supabase.from('shops').select('*').eq('id', id).single(),
        supabase.from('designers').select('*').eq('shop_id', id).eq('is_active', true).order('sort_order'),
        supabase.from('menus').select('*').eq('shop_id', id).eq('is_active', true).order('sort_order'),
        supabase.from('reviews').select('*, customer:users(name)').eq('shop_id', id).eq('is_visible', true).order('created_at', { ascending: false }).limit(20),
      ])
      setShop(shopRes.data as Shop | null)
      setDesigners((designerRes.data as Designer[]) || [])
      setMenus((menuRes.data as Menu[]) || [])
      setReviews((reviewRes.data as Review[]) || [])
      setLoading(false)
    }
    fetch()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="w-full aspect-[2/1] rounded-2xl" />
        <Skeleton className="w-48 h-8" />
        <Skeleton className="w-full h-24" />
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">매장을 찾을 수 없습니다</p>
        <Link href="/search">
          <Button variant="outline" className="mt-4">매장 검색하기</Button>
        </Link>
      </div>
    )
  }

  const menuCategories = [...new Set(menus.map(m => m.category || '기타'))]
  const lowestPrice = menus.length > 0
    ? Math.min(...menus.map(m => m.discount_price ?? m.price))
    : 0

  return (
    <div className="max-w-3xl mx-auto">
      {/* 커버 */}
      <div className="relative aspect-[2/1] bg-gradient-to-br from-brand-light via-muted to-brand-light">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-bold text-brand/10">{shop.name[0]}</span>
        </div>
        <div className="absolute top-4 left-4">
          <Link href="/search" className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
            <Heart className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4">
        <div className="py-6">
          <Badge variant="secondary" className="mb-2">{CAT_LABEL[shop.category] ?? shop.category}</Badge>
          <h1 className="text-2xl font-bold">{shop.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="text-lg font-bold">{Number(shop.avg_rating).toFixed(1)}</span>
            <span className="text-muted-foreground">리뷰 {shop.review_count}</span>
          </div>
          {shop.description && (
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{shop.description}</p>
          )}
          <div className="mt-4 space-y-2 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0" />
              {shop.address} {shop.address_detail}
            </p>
            {shop.phone && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0" />
                {shop.phone}
              </p>
            )}
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="menu" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="menu" className="flex-1">시술 메뉴</TabsTrigger>
            <TabsTrigger value="designer" className="flex-1">디자이너</TabsTrigger>
            <TabsTrigger value="review" className="flex-1">리뷰 ({shop.review_count})</TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="mt-4 space-y-6 pb-24">
            {menus.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">등록된 메뉴가 없습니다</p>
            ) : (
              menuCategories.map(cat => (
                <div key={cat}>
                  <h3 className="font-semibold text-base mb-3">{cat}</h3>
                  <div className="space-y-2">
                    {menus.filter(m => (m.category || '기타') === cat).map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-colors">
                        <div>
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" /> {item.duration}분
                          </span>
                        </div>
                        <div className="text-right">
                          {item.discount_price ? (
                            <div>
                              <span className="text-xs text-muted-foreground line-through">{item.price.toLocaleString()}원</span>
                              <p className="text-brand font-bold">{item.discount_price.toLocaleString()}원</p>
                            </div>
                          ) : (
                            <p className="font-bold">{item.price.toLocaleString()}원</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="designer" className="mt-4 space-y-3 pb-24">
            {designers.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">등록된 디자이너가 없습니다</p>
            ) : (
              designers.map(d => (
                <Card key={d.id}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback className="bg-brand-light text-brand font-bold text-lg">
                        {d.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{d.name}</h4>
                        {d.title && <Badge variant="secondary" className="text-[10px]">{d.title}</Badge>}
                      </div>
                      {d.introduction && <p className="text-sm text-muted-foreground mt-0.5">{d.introduction}</p>}
                    </div>
                    <Link href={`/shop/${id}/booking?designer=${d.id}`}>
                      <Button size="sm" className="bg-brand hover:bg-brand-dark text-white">예약</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="review" className="mt-4 space-y-4 pb-24">
            {reviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">아직 리뷰가 없습니다</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="p-4 rounded-xl border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-muted text-xs">
                          {(review.customer as unknown as { name: string })?.name?.[0] ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {(review.customer as unknown as { name: string })?.name ?? '익명'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{new Date(review.created_at).toLocaleDateString('ko')}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  {review.content && <p className="text-sm mt-2 leading-relaxed">{review.content}</p>}
                  {review.owner_reply && (
                    <div className="mt-3 p-3 rounded-xl bg-brand-light/50">
                      <p className="text-xs font-medium text-brand mb-1">사장님 답글</p>
                      <p className="text-xs text-muted-foreground">{review.owner_reply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* 하단 예약 버튼 */}
      {menus.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t p-4 z-40 md:max-w-3xl md:mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">최저</p>
              <p className="text-lg font-bold text-brand">{lowestPrice.toLocaleString()}원~</p>
            </div>
            <Link href={`/shop/${id}/booking`} className="flex-1">
              <Button className="w-full h-12 bg-brand hover:bg-brand-dark text-white text-base font-semibold rounded-xl">
                <Calendar className="w-5 h-5 mr-2" />
                예약하기
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
