'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Clock, Banknote } from 'lucide-react'

interface MenuItem {
  id: string
  category: string
  name: string
  price: number
  discountPrice: number | null
  duration: number
  isActive: boolean
}

const INITIAL_MENUS: MenuItem[] = [
  { id: '1', category: '커트', name: '여성 커트', price: 30000, discountPrice: null, duration: 40, isActive: true },
  { id: '2', category: '커트', name: '남성 커트', price: 20000, discountPrice: null, duration: 30, isActive: true },
  { id: '3', category: '커트', name: '커트 + 셋팅', price: 45000, discountPrice: 40000, duration: 50, isActive: true },
  { id: '4', category: '염색', name: '전체 염색', price: 80000, discountPrice: null, duration: 90, isActive: true },
  { id: '5', category: '염색', name: '부분 염색 (뿌리)', price: 50000, discountPrice: null, duration: 60, isActive: true },
  { id: '6', category: '펌', name: '디지털 펌', price: 120000, discountPrice: 100000, duration: 120, isActive: true },
  { id: '7', category: '펌', name: '볼륨 매직', price: 150000, discountPrice: null, duration: 150, isActive: true },
  { id: '8', category: '클리닉', name: '두피 클리닉', price: 40000, discountPrice: null, duration: 30, isActive: true },
  { id: '9', category: '클리닉', name: '모발 클리닉', price: 30000, discountPrice: null, duration: 20, isActive: true },
]

export default function MenusPage() {
  const [menus, setMenus] = useState(INITIAL_MENUS)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<MenuItem | null>(null)
  const [form, setForm] = useState({
    category: '', name: '', price: '', discountPrice: '', duration: '',
  })

  const categories = [...new Set(menus.map(m => m.category))]

  const openAdd = () => {
    setEditTarget(null)
    setForm({ category: '', name: '', price: '', discountPrice: '', duration: '' })
    setDialogOpen(true)
  }

  const openEdit = (m: MenuItem) => {
    setEditTarget(m)
    setForm({
      category: m.category,
      name: m.name,
      price: String(m.price),
      discountPrice: m.discountPrice ? String(m.discountPrice) : '',
      duration: String(m.duration),
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.price || !form.duration) {
      toast.error('필수 항목을 모두 입력해주세요.')
      return
    }
    const data: MenuItem = {
      id: editTarget?.id || `m${Date.now()}`,
      category: form.category || '기타',
      name: form.name,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      duration: Number(form.duration),
      isActive: editTarget?.isActive ?? true,
    }
    if (editTarget) {
      setMenus(prev => prev.map(m => m.id === editTarget.id ? data : m))
      toast.success('메뉴가 수정되었습니다.')
    } else {
      setMenus(prev => [...prev, data])
      toast.success('메뉴가 추가되었습니다.')
    }
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setMenus(prev => prev.filter(m => m.id !== id))
    toast.success('메뉴가 삭제되었습니다.')
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

      {categories.map(cat => (
        <Card key={cat} className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{cat}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {menus.filter(m => m.category === cat).map(menu => (
              <div
                key={menu.id}
                className={`flex items-center gap-4 p-3 rounded-xl border ${
                  !menu.isActive ? 'opacity-50 bg-muted/30' : 'hover:bg-muted/30'
                } transition-colors`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{menu.name}</h4>
                    {menu.discountPrice && (
                      <Badge className="bg-red-50 text-red-500 border-red-200 text-[10px]">할인</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Banknote className="w-3 h-3" />
                      {menu.discountPrice ? (
                        <>
                          <span className="line-through">{menu.price.toLocaleString()}</span>
                          <span className="text-brand font-semibold">{menu.discountPrice.toLocaleString()}원</span>
                        </>
                      ) : (
                        <span>{menu.price.toLocaleString()}원</span>
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {menu.duration}분
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(menu)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(menu.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? '메뉴 수정' : '메뉴 추가'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>카테고리</Label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="커트, 염색, 펌 등" />
              </div>
              <div className="space-y-2">
                <Label>메뉴명 *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="여성 커트" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>정가 (원) *</Label>
                <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="30000" />
              </div>
              <div className="space-y-2">
                <Label>할인가 (원)</Label>
                <Input type="number" value={form.discountPrice} onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))} placeholder="25000" />
              </div>
              <div className="space-y-2">
                <Label>소요시간 (분) *</Label>
                <Input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="30" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>취소</Button>
              <Button className="flex-1 bg-brand hover:bg-brand-dark text-white" onClick={handleSave}>
                {editTarget ? '수정' : '추가'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
