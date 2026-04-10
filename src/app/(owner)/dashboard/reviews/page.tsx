'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Star, MessageSquare, Send } from 'lucide-react'
import { toast } from 'sonner'

const DEMO_REVIEWS = [
  { id: '1', customer: '김지연', rating: 5, content: '커트 너무 잘해주셨어요! 원하는 스타일 잘 잡아주셔서 감사합니다.', designer: '김수진 원장', date: '2026-04-08', menu: '커트 + 셋팅', reply: null },
  { id: '2', customer: '이하은', rating: 4, content: '염색 색감이 예뻐요. 다음에 또 올게요~', designer: '박서윤 실장', date: '2026-04-05', menu: '전체 염색', reply: '감사합니다! 색 유지 위해 보라색 샴푸 추천드려요 :)' },
  { id: '3', customer: '최민서', rating: 5, content: '디지털 펌 대만족이요!!! 볼륨감이 살아있어서 매일 머리하기 편해요', designer: '김수진 원장', date: '2026-04-01', menu: '디지털 펌', reply: null },
]

export default function OwnerReviewsPage() {
  const [reviews, setReviews] = useState(DEMO_REVIEWS)
  const [replyTarget, setReplyTarget] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const handleReply = (reviewId: string) => {
    if (!replyText.trim()) return
    setReviews(prev =>
      prev.map(r => r.id === reviewId ? { ...r, reply: replyText } : r)
    )
    setReplyTarget(null)
    setReplyText('')
    toast.success('답글이 등록되었습니다.')
  }

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">리뷰 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            평균 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" /> {avgRating} · 총 {reviews.length}건
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map(review => (
          <Card key={review.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{review.customer}</span>
                    <Badge variant="secondary" className="text-[10px]">{review.menu}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {review.designer} · {review.date}
                  </p>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm mt-3 leading-relaxed">{review.content}</p>

              {/* 답글 */}
              {review.reply ? (
                <div className="mt-3 p-3 rounded-xl bg-brand-light/50">
                  <p className="text-xs font-medium text-brand mb-1">사장님 답글</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{review.reply}</p>
                </div>
              ) : replyTarget === review.id ? (
                <div className="mt-3 space-y-2">
                  <Textarea
                    placeholder="답글을 작성해주세요..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={2}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setReplyTarget(null)}>취소</Button>
                    <Button
                      size="sm"
                      className="bg-brand hover:bg-brand-dark text-white"
                      onClick={() => handleReply(review.id)}
                    >
                      <Send className="w-3.5 h-3.5 mr-1" /> 답글 등록
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-brand"
                  onClick={() => { setReplyTarget(review.id); setReplyText('') }}
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1" /> 답글 작성
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
