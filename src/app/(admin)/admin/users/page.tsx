'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const ROLE_MAP: Record<string, { label: string; color: string }> = {
  customer: { label: '고객', color: 'bg-blue-50 text-blue-600' },
  owner: { label: '사장님', color: 'bg-violet-50 text-violet-600' },
  admin: { label: '관리자', color: 'bg-red-50 text-red-600' },
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false }).limit(100)
      setUsers(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <div className="p-6 lg:p-8 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">사용자 관리</h1>
      <p className="text-sm text-muted-foreground mb-8">총 {users.length}명</p>

      {users.length === 0 ? (
        <div className="text-center py-16"><Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground">가입된 회원이 없습니다</p></div>
      ) : (
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/30 transition-colors">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-brand-light text-brand text-sm font-semibold">{u.name?.[0] ?? '?'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{u.name}</span>
                  <Badge variant="secondary" className={`text-[10px] ${ROLE_MAP[u.role]?.color || ''}`}>{ROLE_MAP[u.role]?.label || u.role}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{new Date(u.created_at).toLocaleDateString('ko')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
