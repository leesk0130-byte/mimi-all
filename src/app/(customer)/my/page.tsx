'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CalendarDays, Star, Heart, Settings, ChevronRight,
  Store, LogOut, Shield,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const MENU_ITEMS = [
  { href: '/my/bookings', label: '예약 내역', icon: CalendarDays, desc: '예약 확인 및 취소' },
  { href: '/my/reviews', label: '내 리뷰', icon: Star, desc: '작성한 리뷰 관리' },
]

export default function MyPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="w-24 h-5" />
            <Skeleton className="w-40 h-4" />
          </div>
        </div>
        {[1,2,3].map(i => <Skeleton key={i} className="w-full h-16 rounded-xl" />)}
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Settings className="w-7 h-7 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold">로그인이 필요합니다</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          예약 내역, 리뷰 등을 확인하려면 로그인해주세요.
        </p>
        <div className="flex gap-2 justify-center mt-6">
          <Link href="/login">
            <Button className="bg-brand hover:bg-brand-dark text-white">로그인</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline">회원가입</Button>
          </Link>
        </div>
      </div>
    )
  }

  const roleLabel: Record<string, string> = {
    customer: '일반 회원',
    owner: '입점 사장님',
    admin: '관리자',
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* 프로필 카드 */}
      <div className="bg-white rounded-2xl border p-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback className="bg-brand text-white text-xl font-bold">
              {user.name?.[0] ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{user.name}</h2>
              <Badge variant="secondary" className="text-[10px]">
                {roleLabel[user.role]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.phone && (
              <p className="text-sm text-muted-foreground">{user.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* 메뉴 */}
      <div className="mt-6 bg-white rounded-2xl border overflow-hidden">
        {MENU_ITEMS.map(({ href, label, icon: Icon, desc }, i) => (
          <div key={href}>
            {i > 0 && <Separator />}
            <Link
              href={href}
              className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center">
                <Icon className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </div>
        ))}
      </div>

      {/* 사장님/관리자 전용 */}
      {(user.role === 'owner' || user.role === 'admin') && (
        <div className="mt-4 bg-white rounded-2xl border overflow-hidden">
          <Link
            href={user.role === 'admin' ? '/admin' : '/dashboard'}
            className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
              {user.role === 'admin' ? (
                <Shield className="w-5 h-5 text-violet-500" />
              ) : (
                <Store className="w-5 h-5 text-violet-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">
                {user.role === 'admin' ? '관리자 대시보드' : '샵 관리 대시보드'}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.role === 'admin' ? '전체 플랫폼 관리' : '예약, 매출, 리뷰 관리'}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        </div>
      )}

      {/* 로그아웃 */}
      <div className="mt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border bg-white hover:bg-muted/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-500" />
          </div>
          <span className="font-medium text-sm text-red-600">로그아웃</span>
        </button>
      </div>
    </div>
  )
}
