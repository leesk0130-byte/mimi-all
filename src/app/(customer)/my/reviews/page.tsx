'use client'

import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Star, MessageSquare } from 'lucide-react'
import Link from 'next/link'

const DEMO_REVIEWS = [
  {
    id: '1', shopName: '젤리네일 스튜디오', designerName: '박예린',
    rating: 5, content: '손톱이 예뻐졌어요! 친절하고 꼼꼼하게 해주셨습니다.',
    date: '2026-04-08', ownerReply: '감사합니다! 다음에 또 뵐게요 :)',
  },
  {
    id: '2', shopName: '루미에르 헤어', designerName: '김수진 원장',
    rating: 4, content: '분위기 좋고 커트 잘해주셨어요. 다음에 염색도 해보려구요.',
    date: '2026-03-25', ownerReply: null,
  },
]

export default function MyReviewsPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
        {[1,2].map(i => <Skeleton key={i} className="w-full h-40 rounded-2xl" />)}
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold">로그인이 필요합니다</h2>
        <Link href="/login?redirect=/my/reviews">
          <Button className="mt-4 bg-brand hover:bg-brand-dark text-white">로그인</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">내 리뷰</h1>

      {DEMO_REVIEWS.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">작성한 리뷰가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {DEMO_REVIEWS.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm">{review.shopName}</h3>
                  <p className="text-xs text-muted-foreground">{review.designerName} · {review.date}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm mt-3 leading-relaxed">{review.content}</p>

              {review.ownerReply && (
                <div className="mt-3 p-3 rounded-xl bg-muted/50">
                  <p className="text-xs font-medium text-brand mb-1">사장님 답글</p>
                  <p className="text-xs text-muted-foreground">{review.ownerReply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
