import Link from 'next/link'
import {
  Scissors, Sparkles, Heart, Eye, Zap, User, Palette,
  Search, ChevronRight, Clock, Star, TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'

const CATEGORIES = [
  { value: 'hair', label: '헤어샵', icon: Scissors, color: 'bg-rose-50 text-rose-500' },
  { value: 'nail', label: '네일샵', icon: Sparkles, color: 'bg-purple-50 text-purple-500' },
  { value: 'skin', label: '피부관리', icon: Heart, color: 'bg-pink-50 text-pink-500' },
  { value: 'lash', label: '속눈썹', icon: Eye, color: 'bg-blue-50 text-blue-500' },
  { value: 'waxing', label: '왁싱', icon: Zap, color: 'bg-amber-50 text-amber-500' },
  { value: 'barber', label: '바버샵', icon: User, color: 'bg-emerald-50 text-emerald-500' },
  { value: 'makeup', label: '메이크업', icon: Palette, color: 'bg-violet-50 text-violet-500' },
]

const QUICK_FILTERS = [
  { label: '당일예약', href: '/search?available=today', icon: Clock },
  { label: '인기순', href: '/search?sort=popular', icon: TrendingUp },
  { label: '높은평점', href: '/search?sort=rating', icon: Star },
]

const CAT_LABEL: Record<string, string> = {
  hair: '헤어', nail: '네일', skin: '피부관리',
  lash: '속눈썹', barber: '바버', waxing: '왁싱', makeup: '메이크업',
}

export default async function HomePage() {
  const supabase = await createClient()

  const { data: popularShops } = await supabase
    .from('shops')
    .select('*')
    .eq('status', 'approved')
    .order('review_count', { ascending: false })
    .limit(6)

  const { data: newShops } = await supabase
    .from('shops')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen">
      {/* 히어로 */}
      <section className="relative bg-gradient-to-br from-brand via-brand-dark to-brand overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.1),transparent_40%)]" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              내 주변 뷰티샵<br />
              <span className="text-white/80">한눈에 비교하고</span><br />
              바로 예약하세요
            </h1>
            <p className="mt-4 text-white/70 text-base md:text-lg">
              헤어, 네일, 피부관리, 속눈썹, 왁싱, 바버샵까지
            </p>

            <div className="mt-8 flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Link href="/search" className="block">
                  <div className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/95 backdrop-blur-sm flex items-center text-muted-foreground text-sm shadow-lg hover:bg-white transition-colors cursor-pointer">
                    지역, 샵 이름, 시술로 검색
                  </div>
                </Link>
              </div>
              <Link
                href="/search"
                className="h-12 px-6 bg-white text-brand hover:bg-white/90 shadow-lg font-semibold rounded-xl inline-flex items-center justify-center text-sm"
              >
                검색
              </Link>
            </div>

            <div className="flex gap-2 mt-4">
              {QUICK_FILTERS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-medium backdrop-blur-sm transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 카테고리 */}
      <section className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg border p-6">
          <div className="grid grid-cols-4 md:grid-cols-7 gap-4">
            {CATEGORIES.map(({ value, label, icon: Icon, color }) => (
              <Link
                key={value}
                href={`/search?category=${value}`}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 프로모션 배너 */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-violet-500 to-purple-600 p-6 md:p-8 text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
            <Badge className="bg-white/20 text-white border-0 mb-3">입점 혜택</Badge>
            <h3 className="text-xl font-bold">수수료 0.3%</h3>
            <p className="text-white/70 text-sm mt-1">업계 최저 수수료로 시작하세요</p>
            <Link
              href="/signup?role=owner"
              className="inline-flex items-center mt-4 px-4 py-2 rounded-lg bg-white text-violet-600 hover:bg-white/90 text-sm font-semibold transition-colors"
            >
              무료 입점하기
            </Link>
          </div>
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-brand to-rose-400 p-6 md:p-8 text-white">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
            <Badge className="bg-white/20 text-white border-0 mb-3">첫 방문 할인</Badge>
            <h3 className="text-xl font-bold">신규 가입 혜택</h3>
            <p className="text-white/70 text-sm mt-1">첫 예약 시 특별 할인</p>
            <Link
              href="/signup"
              className="inline-flex items-center mt-4 px-4 py-2 rounded-lg bg-white text-brand hover:bg-white/90 text-sm font-semibold transition-colors"
            >
              가입하기
            </Link>
          </div>
        </div>
      </section>

      {/* 인기 뷰티샵 */}
      <section className="max-w-7xl mx-auto px-4 mt-12 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">인기 뷰티샵</h2>
            <p className="text-sm text-muted-foreground mt-1">재예약이 많은 인기 샵</p>
          </div>
          <Link href="/search?sort=popular" className="flex items-center gap-1 text-sm text-brand font-medium hover:underline">
            전체보기 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {popularShops && popularShops.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularShops.map((shop) => (
              <Link
                key={shop.id}
                href={`/shop/${shop.id}`}
                className="group block rounded-2xl overflow-hidden bg-card border hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-brand-light to-muted flex items-center justify-center">
                    <span className="text-3xl font-bold text-brand/20">{shop.name[0]}</span>
                  </div>
                  <Badge className="absolute top-2 left-2 bg-white/90 text-foreground text-[10px] backdrop-blur-sm">
                    {CAT_LABEL[shop.category] ?? shop.category}
                  </Badge>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate">{shop.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium">{Number(shop.avg_rating).toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({shop.review_count})</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 truncate">{shop.address}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl border bg-muted/20">
            <Scissors className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">아직 입점된 매장이 없습니다</p>
            <p className="text-xs text-muted-foreground mt-1">첫 번째 입점 매장이 되어보세요!</p>
            <Link
              href="/signup?role=owner"
              className="inline-flex items-center mt-4 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors"
            >
              무료 입점 신청
            </Link>
          </div>
        )}
      </section>

      {/* 새로 오픈 */}
      <section className="bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">새로 오픈한 매장</h2>
              <p className="text-sm text-muted-foreground mt-1">따끈따끈 신규 입점 샵</p>
            </div>
            <Link href="/search?sort=newest" className="flex items-center gap-1 text-sm text-brand font-medium hover:underline">
              전체보기 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {newShops && newShops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {newShops.map((shop) => (
                <Link
                  key={shop.id}
                  href={`/shop/${shop.id}`}
                  className="group flex gap-4 p-4 rounded-2xl bg-white border hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-muted">
                    <div className="w-full h-full bg-gradient-to-br from-brand-light to-muted flex items-center justify-center">
                      <span className="text-2xl font-bold text-brand/20">{shop.name[0]}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge variant="secondary" className="text-[10px]">{CAT_LABEL[shop.category] ?? shop.category}</Badge>
                    <h3 className="font-semibold mt-1 truncate">{shop.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{Number(shop.avg_rating).toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">리뷰 {shop.review_count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{shop.address}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl border bg-white">
              <p className="text-muted-foreground text-sm">아직 신규 매장이 없습니다</p>
            </div>
          )}
        </div>
      </section>

      {/* 입점 CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(214,76,123,0.3),transparent_60%)]" />
          <div className="relative">
            <Badge className="bg-brand/20 text-brand-light border-0 mb-4">사장님 전용</Badge>
            <h2 className="text-2xl md:text-3xl font-bold">우리 샵도 미미올에서 만나보세요</h2>
            <p className="text-white/60 mt-3 max-w-md mx-auto">
              업계 최저 0.3% 수수료 · 실시간 예약 관리 · 매출 통계<br />
              지금 무료로 입점하세요
            </p>
            <Link
              href="/signup?role=owner"
              className="inline-flex items-center mt-8 px-8 py-3 rounded-xl bg-brand hover:bg-brand-dark text-white text-sm font-semibold transition-colors"
            >
              무료 입점 신청
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
