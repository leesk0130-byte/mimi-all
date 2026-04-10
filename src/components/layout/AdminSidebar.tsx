'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  Users,
  CalendarDays,
  CreditCard,
  BarChart3,
  ArrowLeft,
  Shield,
} from 'lucide-react'

const MENU_ITEMS = [
  { href: '/admin', label: '관리자 홈', icon: LayoutDashboard, exact: true },
  { href: '/admin/shops', label: '입점 관리', icon: Store },
  { href: '/admin/users', label: '사용자 관리', icon: Users },
  { href: '/admin/bookings', label: '예약 모니터링', icon: CalendarDays },
  { href: '/admin/payments', label: '결제 모니터링', icon: CreditCard },
  { href: '/admin/settlement', label: '정산 관리', icon: BarChart3 },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-sidebar min-h-screen">
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          미미올 홈
        </Link>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand" />
          <h2 className="text-lg font-bold">관리자</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">전체 플랫폼 관리</p>
      </div>

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
    </aside>
  )
}
