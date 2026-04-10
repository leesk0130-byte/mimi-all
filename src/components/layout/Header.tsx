'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Bell, Menu } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const NAV_ITEMS = [
  { href: '/', label: '홈' },
  { href: '/search', label: '내 주변' },
  { href: '/search?category=hair', label: '헤어' },
  { href: '/search?category=nail', label: '네일' },
  { href: '/search?category=skin', label: '피부관리' },
  { href: '/search?category=lash', label: '속눈썹' },
]

export function Header() {
  const pathname = usePathname()
  const { user } = useAuth()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold tracking-tight">
              미미올
            </span>
          </Link>

          {/* 데스크탑 네비게이션 */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href.split('?')[0])
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-brand bg-brand-light'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* 우측 액션 */}
          <div className="flex items-center gap-2">
            <Link href="/search" className="hidden md:flex">
              <Button variant="ghost" size="icon">
                <Search className="w-5 h-5" />
              </Button>
            </Link>

            {user ? (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand rounded-full" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Avatar className="w-8 h-8 cursor-pointer">
                      <AvatarImage src={user.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-brand text-white text-xs">
                        {user.name?.[0] ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/my')}>
                      마이페이지
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/my/bookings')}>
                      예약 내역
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/my/reviews')}>
                      내 리뷰
                    </DropdownMenuItem>
                    {(user.role === 'owner' || user.role === 'admin') && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => router.push(user.role === 'admin' ? '/admin' : '/dashboard')}
                        >
                          {user.role === 'admin' ? '관리자 패널' : '샵 관리'}
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm">로그인</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-brand hover:bg-brand-dark text-white">회원가입</Button>
                </Link>
              </div>
            )}

            {/* 모바일 메뉴 */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger className="md:hidden">
                <Menu className="w-5 h-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <nav className="flex flex-col gap-1 mt-8">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 rounded-lg text-base font-medium hover:bg-muted transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                  {!user && (
                    <>
                      <div className="my-2 border-t" />
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-3 rounded-lg text-base font-medium hover:bg-muted"
                      >
                        로그인
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
