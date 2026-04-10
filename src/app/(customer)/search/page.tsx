'use client'

import { useState, useMemo, Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Search, Star, MapPin, SlidersHorizontal, X } from 'lucide-react'
import { SHOP_CATEGORIES } from '@/types'
import { createClient } from '@/lib/supabase/client'
import type { Shop } from '@/types'

const CAT_LABEL: Record<string, string> = {
  hair: '헤어', nail: '네일', skin: '피부관리',
  lash: '속눈썹', barber: '바버', waxing: '왁싱', makeup: '메이크업',
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const initialCat = searchParams.get('category') || 'all'

  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initialCat)
  const [sortBy, setSortBy] = useState('popular')
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true)
      const supabase = createClient()
      let q = supabase
        .from('shops')
        .select('*')
        .eq('status', 'approved')

      if (selectedCategory !== 'all') {
        q = q.eq('category', selectedCategory)
      }

      if (sortBy === 'rating') q = q.order('avg_rating', { ascending: false })
      else if (sortBy === 'reviews') q = q.order('review_count', { ascending: false })
      else if (sortBy === 'newest') q = q.order('created_at', { ascending: false })
      else q = q.order('review_count', { ascending: false })

      const { data } = await q.limit(30)
      setShops((data as Shop[]) || [])
      setLoading(false)
    }
    fetchShops()
  }, [selectedCategory, sortBy])

  const filtered = useMemo(() => {
    if (!query) return shops
    const q = query.toLowerCase()
    return shops.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q)
    )
  }, [query, shops])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 검색바 */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          className="pl-12 h-12 rounded-xl text-base"
          placeholder="지역, 샵 이름으로 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setQuery('')}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-brand text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          전체
        </button>
        {SHOP_CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setSelectedCategory(value)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === value
                ? 'bg-brand text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 정렬 + 결과 수 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {filtered.length}개의 매장
        </p>
        <Select value={sortBy} onValueChange={(v) => v && setSortBy(v)}>
          <SelectTrigger className="w-32">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">인기순</SelectItem>
            <SelectItem value="rating">평점순</SelectItem>
            <SelectItem value="reviews">리뷰많은순</SelectItem>
            <SelectItem value="newest">최신순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 결과 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="rounded-2xl border bg-muted/20 h-64 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">입점된 매장이 없습니다</p>
          <p className="text-xs text-muted-foreground mt-1">곧 새로운 매장이 입점될 예정이에요!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(shop => (
            <Link
              key={shop.id}
              href={`/shop/${shop.id}`}
              className="group block bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-brand-light to-muted flex items-center justify-center">
                  <span className="text-4xl font-bold text-brand/15">{shop.name[0]}</span>
                </div>
                <Badge className="absolute top-3 left-3 bg-white/90 text-foreground text-xs backdrop-blur-sm">
                  {CAT_LABEL[shop.category] ?? shop.category}
                </Badge>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-base group-hover:text-brand transition-colors">{shop.name}</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold">{Number(shop.avg_rating).toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({shop.review_count})</span>
                </div>
                <p className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  {shop.address}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
