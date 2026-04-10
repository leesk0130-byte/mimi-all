'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Store, Users, CalendarDays, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminPage() {
  const [stats, setStats] = useState({ shops: 0, pending: 0, users: 0, reservations: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const [shops, pending, users, reservations] = await Promise.all([
        supabase.from('shops').select('id', { count: 'exact', head: true }),
        supabase.from('shops').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('reservations').select('id', { count: 'exact', head: true }),
      ])
      setStats({
        shops: shops.count || 0, pending: pending.count || 0,
        users: users.count || 0, reservations: reservations.count || 0,
      })
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <div className="p-6 lg:p-8 space-y-4"><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}</div></div>

  const cards = [
    { label: '전체 매장', value: stats.shops, icon: Store, color: 'bg-blue-50 text-blue-500' },
    { label: '승인 대기', value: stats.pending, icon: Store, color: 'bg-amber-50 text-amber-500' },
    { label: '전체 회원', value: stats.users, icon: Users, color: 'bg-green-50 text-green-500' },
    { label: '전체 예약', value: stats.reservations, icon: CalendarDays, color: 'bg-purple-50 text-purple-500' },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-8">관리자 대시보드</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}><Icon className="w-5 h-5" /></div>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
