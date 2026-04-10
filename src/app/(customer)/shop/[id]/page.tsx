'use client'

import { use } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Star, MapPin, Phone, Clock, Heart,
  ChevronRight, Share2, Banknote, Calendar,
} from 'lucide-react'

// 데모 샵 데이터
const SHOP = {
  id: '1',
  name: '루미에르 헤어',
  category: '헤어샵',
  rating: 4.9,
  reviews: 328,
  address: '서울시 강남구 신사동 123-45 2층',
  phone: '02-1234-5678',
  description: '루미에르 헤어는 트렌디한 스타일링과 편안한 분위기를 제공하는 프리미엄 헤어살롱입니다. 15년 경력의 수진 원장님이 직접 시술합니다.',
  hours: '매일 10:00 - 20:00 (일요일 휴무)',
  designers: [
    { id: 'd1', name: '김수진', title: '원장', intro: '15년 경력 · 스타일링 전문' },
    { id: 'd2', name: '박서윤', title: '실장', intro: '트렌디 컬러 전문' },
    { id: 'd3', name: '이도현', title: '디자이너', intro: '남성 커트 전문' },
  ],
  menuCategories: [
    {
      name: '커트',
      items: [
        { id: 'm1', name: '여성 커트', price: 30000, discountPrice: null, duration: 40 },
        { id: 'm2', name: '남성 커트', price: 20000, discountPrice: null, duration: 30 },
        { id: 'm3', name: '커트 + 셋팅', price: 45000, discountPrice: 40000, duration: 50 },
      ],
    },
    {
      name: '염색',
      items: [
        { id: 'm4', name: '전체 염색', price: 80000, discountPrice: null, duration: 90 },
        { id: 'm5', name: '부분 염색 (뿌리)', price: 50000, discountPrice: null, duration: 60 },
      ],
    },
    {
      name: '펌',
      items: [
        { id: 'm6', name: '디지털 펌', price: 120000, discountPrice: 100000, duration: 120 },
        { id: 'm7', name: '볼륨 매직', price: 150000, discountPrice: null, duration: 150 },
      ],
    },
    {
      name: '클리닉',
      items: [
        { id: 'm8', name: '두피 클리닉', price: 40000, discountPrice: null, duration: 30 },
        { id: 'm9', name: '모발 클리닉', price: 30000, discountPrice: null, duration: 20 },
      ],
    },
  ],
  demoReviews: [
    { id: 'r1', customer: '김지연', rating: 5, content: '커트 너무 잘해주셨어요! 원하는 스타일 잘 잡아주셔서 감사합니다.', designer: '김수진 원장', date: '2026-04-08' },
    { id: 'r2', customer: '이하은', rating: 4, content: '염색 색감이 예뻐요. 다음에 또 올게요~', designer: '박서윤 실장', date: '2026-04-05' },
    { id: 'r3', customer: '최민서', rating: 5, content: '디지털 펌 대만족이요!!!', designer: '김수진 원장', date: '2026-04-01' },
  ],
}

export default function ShopDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <div className="max-w-3xl mx-auto">
      {/* 커버 이미지 */}
      <div className="relative aspect-[2/1] bg-gradient-to-br from-brand-light via-muted to-brand-light">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-bold text-brand/10">{SHOP.name[0]}</span>
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
        {/* 기본 정보 */}
        <div className="py-6">
          <Badge variant="secondary" className="mb-2">{SHOP.category}</Badge>
          <h1 className="text-2xl font-bold">{SHOP.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="text-lg font-bold">{SHOP.rating}</span>
            <span className="text-muted-foreground">리뷰 {SHOP.reviews}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{SHOP.description}</p>

          <div className="mt-4 space-y-2 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0" />
              {SHOP.address}
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4 shrink-0" />
              {SHOP.phone}
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4 shrink-0" />
              {SHOP.hours}
            </p>
          </div>
        </div>

        <Separator />

        {/* 탭 */}
        <Tabs defaultValue="menu" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="menu" className="flex-1">시술 메뉴</TabsTrigger>
            <TabsTrigger value="designer" className="flex-1">디자이너</TabsTrigger>
            <TabsTrigger value="review" className="flex-1">리뷰 ({SHOP.reviews})</TabsTrigger>
          </TabsList>

          {/* 메뉴 탭 */}
          <TabsContent value="menu" className="mt-4 space-y-6 pb-24">
            {SHOP.menuCategories.map(cat => (
              <div key={cat.name}>
                <h3 className="font-semibold text-base mb-3">{cat.name}</h3>
                <div className="space-y-2">
                  {cat.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-colors">
                      <div>
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" /> {item.duration}분
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {item.discountPrice ? (
                          <div>
                            <span className="text-xs text-muted-foreground line-through">{item.price.toLocaleString()}원</span>
                            <p className="text-brand font-bold">{item.discountPrice.toLocaleString()}원</p>
                          </div>
                        ) : (
                          <p className="font-bold">{item.price.toLocaleString()}원</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* 디자이너 탭 */}
          <TabsContent value="designer" className="mt-4 space-y-3 pb-24">
            {SHOP.designers.map(d => (
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
                      <Badge variant="secondary" className="text-[10px]">{d.title}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{d.intro}</p>
                  </div>
                  <Link href={`/shop/${id}/booking?designer=${d.id}`}>
                    <Button size="sm" className="bg-brand hover:bg-brand-dark text-white">
                      예약
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* 리뷰 탭 */}
          <TabsContent value="review" className="mt-4 space-y-4 pb-24">
            {/* 리뷰 요약 */}
            <div className="flex items-center gap-6 p-5 rounded-2xl bg-muted/30">
              <div className="text-center">
                <p className="text-3xl font-bold">{SHOP.rating}</p>
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(SHOP.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-1">
                {[5,4,3,2,1].map(n => {
                  const count = SHOP.demoReviews.filter(r => r.rating === n).length
                  const pct = Math.round((count / SHOP.demoReviews.length) * 100)
                  return (
                    <div key={n} className="flex items-center gap-2 text-xs">
                      <span className="w-2">{n}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {SHOP.demoReviews.map(review => (
              <div key={review.id} className="p-4 rounded-xl border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-muted text-xs">{review.customer[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{review.customer}</p>
                      <p className="text-[10px] text-muted-foreground">{review.designer} · {review.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm mt-2 leading-relaxed">{review.content}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* 하단 고정 예약 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t p-4 z-40 md:max-w-3xl md:mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">최저</p>
            <p className="text-lg font-bold text-brand">20,000원~</p>
          </div>
          <Link href={`/shop/${id}/booking`} className="flex-1">
            <Button className="w-full h-12 bg-brand hover:bg-brand-dark text-white text-base font-semibold rounded-xl">
              <Calendar className="w-5 h-5 mr-2" />
              예약하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
