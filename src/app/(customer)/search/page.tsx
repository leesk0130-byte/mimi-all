'use client'

import { useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Search, Star, MapPin, SlidersHorizontal, X } from 'lucide-react'
import { SHOP_CATEGORIES } from '@/types'

const ALL_SHOPS = [
  { id: '1', name: '루미에르 헤어', category: 'hair', rating: 4.9, reviews: 328, address: '강남구 신사동', price: '커트 30,000원~', tags: ['인기', '당일예약'] },
  { id: '2', name: '젤리네일 스튜디오', category: 'nail', rating: 4.8, reviews: 156, address: '마포구 연남동', price: '젤네일 40,000원~', tags: ['신규'] },
  { id: '3', name: '글로우 에스테틱', category: 'skin', rating: 4.7, reviews: 89, address: '서초구 반포동', price: '기본 관리 60,000원~', tags: ['인기'] },
  { id: '4', name: '뷰티래쉬', category: 'lash', rating: 4.9, reviews: 201, address: '강남구 청담동', price: '속눈썹 연장 50,000원~', tags: ['당일예약'] },
  { id: '5', name: '바버샵 그루밍', category: 'barber', rating: 4.6, reviews: 94, address: '용산구 이태원동', price: '남성 커트 18,000원~', tags: [] },
  { id: '6', name: '헤어살롱 봄', category: 'hair', rating: 4.8, reviews: 412, address: '성동구 성수동', price: '커트 25,000원~', tags: ['인기', '신규'] },
  { id: '7', name: '네일아뜨리에', category: 'nail', rating: 4.5, reviews: 67, address: '강남구 역삼동', price: '기본 네일 35,000원~', tags: [] },
  { id: '8', name: '스킨랩 피부과학', category: 'skin', rating: 4.8, reviews: 143, address: '송파구 잠실동', price: '모공 관리 80,000원~', tags: ['인기'] },
  { id: '9', name: '클린왁싱', category: 'waxing', rating: 4.7, reviews: 78, address: '강남구 논현동', price: '브라질리언 50,000원~', tags: ['당일예약'] },
  { id: '10', name: '수진 메이크업', category: 'makeup', rating: 4.9, reviews: 234, address: '중구 명동', price: '본식 메이크업 200,000원~', tags: ['인기'] },
  { id: '11', name: '헤어마루', category: 'hair', rating: 4.4, reviews: 55, address: '마포구 홍대입구', price: '커트 20,000원~', tags: ['신규'] },
  { id: '12', name: '래쉬붐', category: 'lash', rating: 4.6, reviews: 112, address: '강남구 신사동', price: '펌 눈썹 30,000원~', tags: [] },
]

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

  const filtered = useMemo(() => {
    let result = ALL_SHOPS

    if (selectedCategory !== 'all') {
      result = result.filter(s => s.category === selectedCategory)
    }

    if (query) {
      const q = query.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.price.toLowerCase().includes(q)
      )
    }

    if (sortBy === 'rating') result = [...result].sort((a, b) => b.rating - a.rating)
    else if (sortBy === 'reviews') result = [...result].sort((a, b) => b.reviews - a.reviews)
    else if (sortBy === 'newest') result = [...result].reverse()

    return result
  }, [query, selectedCategory, sortBy])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 검색바 */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          className="pl-12 h-12 rounded-xl text-base"
          placeholder="지역, 샵 이름, 시술로 검색..."
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

      {/* 결과 리스트 */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground">검색 결과가 없습니다</p>
          <p className="text-xs text-muted-foreground mt-1">다른 키워드로 검색해보세요</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(shop => (
            <Link
              key={shop.id}
              href={`/shop/${shop.id}`}
              className="group block bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* 이미지 */}
              <div className="relative aspect-[16/9] bg-muted overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-brand-light to-muted flex items-center justify-center">
                  <span className="text-4xl font-bold text-brand/15">{shop.name[0]}</span>
                </div>
                <Badge className="absolute top-3 left-3 bg-white/90 text-foreground text-xs backdrop-blur-sm">
                  {CAT_LABEL[shop.category]}
                </Badge>
                {shop.tags.map(tag => (
                  <Badge
                    key={tag}
                    className={`absolute top-3 right-3 text-[10px] ${
                      tag === '인기' ? 'bg-brand text-white' :
                      tag === '당일예약' ? 'bg-blue-500 text-white' :
                      'bg-green-500 text-white'
                    }`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* 정보 */}
              <div className="p-4">
                <h3 className="font-semibold text-base group-hover:text-brand transition-colors">{shop.name}</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold">{shop.rating}</span>
                  <span className="text-sm text-muted-foreground">({shop.reviews})</span>
                </div>
                <p className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  {shop.address}
                </p>
                <p className="text-sm text-brand font-medium mt-2">{shop.price}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
