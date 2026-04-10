'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  Store,
  Users,
  UtensilsCrossed,
  MessageSquare,
  BarChart3,
  ArrowLeft,
} from 'lucide-react'

const MENU_ITEMS = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/calendar', label: '예약 캘린더', icon: CalendarDays },
  { href: '/dashboard/shop', label: '샵 정보', icon: Store },
  { href: '/dashboard/designers', label: '디자이너', icon: Users },
  { href: '/dashboard/menus', label: '시술 메뉴', icon: UtensilsCrossed },
  { href: '/dashboard/reviews', label: '리뷰 관리', icon: MessageSquare },
  { href: '/dashboard/settlement', label: '매출/정산', icon: BarChart3 },
]

export function OwnerSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-sidebar min-h-screen">
      {/* 헤더 */}
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          미미올 홈
        </Link>
        <h2 className="text-lg font-bold">샵 관리</h2>
        <p className="text-xs text-muted-foreground mt-1">원장님 대시보드</p>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 p-3 space-y-1">
        {MENU_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* 하단 배너 */}
      <div className="p-4 m-3 rounded-xl bg-brand-light">
        <p className="text-xs font-semibold text-brand-dark mb-1">수수료 0.3%</p>
        <p className="text-[11px] text-brand-dark/70 leading-snug">
          Point3 간편결제로<br />업계 최저 수수료
        </p>
      </div>
    </aside>
  )
}
