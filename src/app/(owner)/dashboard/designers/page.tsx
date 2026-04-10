'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

export default function DesignersPage() {
  const { user } = useAuth()
  const [designers, setDesigners] = useState<any[]>([])
  const [shopId, setShopId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<any>(null)
  const [form, setForm] = useState({ name: '', title: '', introduction: '' })

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const supabase = createClient()
      const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
      if (shop) {
        setShopId(shop.id)
        const { data } = await supabase.from('designers').select('*').eq('shop_id', shop.id).order('sort_order')
        setDesigners(data || [])
      }
      setLoading(false)
    }
    fetch()
  }, [user])

  const openAdd = () => {
    setEditTarget(null)
    setForm({ name: '', title: '', introduction: '' })
    setDialogOpen(true)
  }

  const openEdit = (d: any) => {
    setEditTarget(d)
    setForm({ name: d.name, title: d.title || '', introduction: d.introduction || '' })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !shopId) { toast.error('이름을 입력해주세요.'); return }
    const supabase = createClient()
    if (editTarget) {
      await supabase.from('designers').update(form).eq('id', editTarget.id)
      setDesigners(prev => prev.map(d => d.id === editTarget.id ? { ...d, ...form } : d))
      toast.success('수정되었습니다.')
    } else {
      const { data } = await supabase.from('designers').insert({ ...form, shop_id: shopId }).select().single()
      if (data) setDesigners(prev => [...prev, data])
      toast.success('추가되었습니다.')
    }
    setDialogOpen(false)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('designers').delete().eq('id', id)
    setDesigners(prev => prev.filter(d => d.id !== id))
    toast.success('삭제되었습니다.')
  }

  if (loading) {
    return <div className="p-6 lg:p-8 max-w-3xl space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">디자이너 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">소속 디자이너 등록 및 관리</p>
        </div>
        <Button className="bg-brand hover:bg-brand-dark text-white" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-1" /> 추가
        </Button>
      </div>

      {designers.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">등록된 디자이너가 없습니다</p>
          <Button className="mt-4 bg-brand hover:bg-brand-dark text-white" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1" /> 첫 디자이너 추가
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {designers.map((designer) => (
            <Card key={designer.id} className={!designer.is_active ? 'opacity-50' : ''}>
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-brand-light text-brand font-semibold">{designer.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{designer.name}</h3>
                    {designer.title && <Badge variant="secondary" className="text-[10px]">{designer.title}</Badge>}
                  </div>
                  {designer.introduction && <p className="text-sm text-muted-foreground truncate">{designer.introduction}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(designer)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(designer.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editTarget ? '디자이너 수정' : '디자이너 추가'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2"><Label>이름</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="홍길동" /></div>
            <div className="space-y-2"><Label>직급</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="원장, 실장, 디자이너 등" /></div>
            <div className="space-y-2"><Label>소개</Label><Textarea value={form.introduction} onChange={e => setForm(f => ({ ...f, introduction: e.target.value }))} placeholder="간단한 소개" rows={2} /></div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>취소</Button>
              <Button className="flex-1 bg-brand hover:bg-brand-dark text-white" onClick={handleSave}>{editTarget ? '수정' : '추가'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
