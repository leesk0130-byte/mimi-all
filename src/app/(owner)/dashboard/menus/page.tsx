'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Clock, Banknote, UtensilsCrossed } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

export default function MenusPage() {
  const { user } = useAuth()
  const [menus, setMenus] = useState<any[]>([])
  const [shopId, setShopId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<any>(null)
  const [form, setForm] = useState({ category: '', name: '', price: '', discount_price: '', duration: '' })

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const supabase = createClient()
      const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
      if (shop) {
        setShopId(shop.id)
        const { data } = await supabase.from('menus').select('*').eq('shop_id', shop.id).order('sort_order')
        setMenus(data || [])
      }
      setLoading(false)
    }
    fetch()
  }, [user])

  const categories = [...new Set(menus.map(m => m.category || '기타'))]

  const openAdd = () => {
    setEditTarget(null)
    setForm({ category: '', name: '', price: '', discount_price: '', duration: '' })
    setDialogOpen(true)
  }

  const openEdit = (m: any) => {
    setEditTarget(m)
    setForm({
      category: m.category || '',
      name: m.name,
      price: String(m.price),
      discount_price: m.discount_price ? String(m.discount_price) : '',
      duration: String(m.duration),
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.price || !form.duration || !shopId) {
      toast.error('필수 항목을 모두 입력해주세요.')
      return
    }
    const supabase = createClient()
    const payload = {
      category: form.category || '기타',
      name: form.name,
      price: Number(form.price),
      discount_price: form.discount_price ? Number(form.discount_price) : null,
      duration: Number(form.duration),
      shop_id: shopId,
    }
    if (editTarget) {
      await supabase.from('menus').update(payload).eq('id', editTarget.id)
      setMenus(prev => prev.map(m => m.id === editTarget.id ? { ...m, ...payload } : m))
      toast.success('수정되었습니다.')
    } else {
      const { data } = await supabase.from('menus').insert(payload).select().single()
      if (data) setMenus(prev => [...prev, data])
      toast.success('추가되었습니다.')
    }
    setDialogOpen(false)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('menus').delete().eq('id', id)
    setMenus(prev => prev.filter(m => m.id !== id))
    toast.success('삭제되었습니다.')
  }

  if (loading) {
    return <div className="p-6 lg:p-8 max-w-3xl space-y-4">{[1,2].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">시술 메뉴 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">시술 항목, 가격, 소요시간 설정</p>
        </div>
        <Button className="bg-brand hover:bg-brand-dark text-white" onClick={openAdd}>
          <Plus className="w-4 h-4 mr-1" /> 메뉴 추가
        </Button>
      </div>

      {menus.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border">
          <UtensilsCrossed className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">등록된 메뉴가 없습니다</p>
          <Button className="mt-4 bg-brand hover:bg-brand-dark text-white" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1" /> 첫 메뉴 추가
          </Button>
        </div>
      ) : (
        categories.map(cat => (
          <Card key={cat} className="mb-6">
            <CardHeader className="pb-2"><CardTitle className="text-base">{cat}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {menus.filter(m => (m.category || '기타') === cat).map(menu => (
                <div key={menu.id} className="flex items-center gap-4 p-3 rounded-xl border hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{menu.name}</h4>
                      {menu.discount_price && <Badge className="bg-red-50 text-red-500 border-red-200 text-[10px]">할인</Badge>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Banknote className="w-3 h-3" />
                        {menu.discount_price ? (
                          <><span className="line-through">{menu.price.toLocaleString()}</span> <span className="text-brand font-semibold">{menu.discount_price.toLocaleString()}원</span></>
                        ) : (
                          <span>{menu.price.toLocaleString()}원</span>
                        )}
                      </span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{menu.duration}분</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(menu)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(menu.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editTarget ? '메뉴 수정' : '메뉴 추가'}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>카테고리</Label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="커트, 염색, 펌 등" /></div>
              <div className="space-y-2"><Label>메뉴명 *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="여성 커트" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>정가 (원) *</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
              <div className="space-y-2"><Label>할인가 (원)</Label><Input type="number" value={form.discount_price} onChange={e => setForm(f => ({ ...f, discount_price: e.target.value }))} /></div>
              <div className="space-y-2"><Label>소요시간 (분) *</Label><Input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} /></div>
            </div>
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
