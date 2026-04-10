'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Star, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function MyReviewsPage() {
  const { user, isLoading } = useAuth()
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('reviews')
        .select('*, shop:shops(name), designer:designers(name)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
      setReviews(data || [])
      setLoading(false)
    }
    fetch()
  }, [user])

  if (isLoading || loading) {
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

      {reviews.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">작성한 리뷰가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm">{review.shop?.name}</h3>
                  <p className="text-xs text-muted-foreground">
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
              {review.owner_reply && (
                <div className="mt-3 p-3 rounded-xl bg-muted/50">
                  <p className="text-xs font-medium text-brand mb-1">사장님 답글</p>
                  <p className="text-xs text-muted-foreground">{review.owner_reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
