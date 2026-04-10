'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Star, MessageSquare, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'

export default function OwnerReviewsPage() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [replyTarget, setReplyTarget] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const supabase = createClient()
      const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
      if (shop) {
        const { data } = await supabase
          .from('reviews')
          .select('*, customer:users(name), designer:designers(name), reservation:reservations(id)')
          .eq('shop_id', shop.id)
          .order('created_at', { ascending: false })
        setReviews(data || [])
      }
      setLoading(false)
    }
    fetch()
  }, [user])

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return
    const supabase = createClient()
    await supabase.from('reviews').update({
      owner_reply: replyText,
      owner_replied_at: new Date().toISOString(),
    }).eq('id', reviewId)
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, owner_reply: replyText } : r))
    setReplyTarget(null)
    setReplyText('')
    toast.success('답글이 등록되었습니다.')
  }

  if (loading) {
    return <div className="p-6 lg:p-8 max-w-3xl space-y-4">{[1,2].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">리뷰 관리</h1>
      <p className="text-sm text-muted-foreground mb-8">총 {reviews.length}건</p>

      {reviews.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border">
          <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">아직 리뷰가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <Card key={review.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-semibold text-sm">{review.customer?.name ?? '익명'}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {review.designer?.name} · {new Date(review.created_at).toLocaleDateString('ko')}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                {review.content && <p className="text-sm mt-3 leading-relaxed">{review.content}</p>}

                {review.owner_reply ? (
                  <div className="mt-3 p-3 rounded-xl bg-brand-light/50">
                    <p className="text-xs font-medium text-brand mb-1">사장님 답글</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{review.owner_reply}</p>
                  </div>
                ) : replyTarget === review.id ? (
                  <div className="mt-3 space-y-2">
                    <Textarea placeholder="답글을 작성해주세요..." value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={2} />
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setReplyTarget(null)}>취소</Button>
                      <Button size="sm" className="bg-brand hover:bg-brand-dark text-white" onClick={() => handleReply(review.id)}>
                        <Send className="w-3.5 h-3.5 mr-1" /> 답글 등록
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" className="mt-2 text-brand" onClick={() => { setReplyTarget(review.id); setReplyText('') }}>
                    <MessageSquare className="w-3.5 h-3.5 mr-1" /> 답글 작성
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
