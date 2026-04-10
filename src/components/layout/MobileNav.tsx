'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, CalendarDays, User, Bookmark } from 'lucide-react'

const TABS = [
  { href: '/', label: '홈', icon: Home },
  { href: '/search', label: '검색', icon: Search },
  { href: '/my/bookings', label: '예약', icon: CalendarDays },
  { href: '/my', label: 'MY', icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  // Owner/Admin 페이지에서는 숨김
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-border md:hidden pb-safe">
      <div className="flex items-center justify-around h-14">
        {TABS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/'
              ? pathname === '/'
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                isActive ? 'text-brand' : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
