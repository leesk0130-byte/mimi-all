'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react'

interface DesignerItem {
  id: string
  name: string
  title: string
  introduction: string
  isActive: boolean
}

const INITIAL_DESIGNERS: DesignerItem[] = [
  { id: '1', name: '김수진', title: '원장', introduction: '15년 경력의 스타일리스트', isActive: true },
  { id: '2', name: '박서윤', title: '실장', introduction: '트렌디한 컬러 전문', isActive: true },
  { id: '3', name: '이도현', title: '디자이너', introduction: '남성 커트 전문', isActive: true },
]

export default function DesignersPage() {
  const [designers, setDesigners] = useState(INITIAL_DESIGNERS)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<DesignerItem | null>(null)
  const [form, setForm] = useState({ name: '', title: '', introduction: '' })

  const openAdd = () => {
    setEditTarget(null)
    setForm({ name: '', title: '', introduction: '' })
    setDialogOpen(true)
  }

  const openEdit = (d: DesignerItem) => {
    setEditTarget(d)
    setForm({ name: d.name, title: d.title, introduction: d.introduction })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('이름을 입력해주세요.')
      return
    }
    if (editTarget) {
      setDesigners(prev =>
        prev.map(d => d.id === editTarget.id ? { ...d, ...form } : d)
      )
      toast.success('디자이너 정보가 수정되었습니다.')
    } else {
      setDesigners(prev => [...prev, {
        id: `d${Date.now()}`,
        ...form,
        isActive: true,
      }])
      toast.success('디자이너가 추가되었습니다.')
    }
    setDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setDesigners(prev => prev.filter(d => d.id !== id))
    toast.success('디자이너가 삭제되었습니다.')
  }

  const toggleActive = (id: string) => {
    setDesigners(prev =>
      prev.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d)
    )
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

      <div className="space-y-3">
        {designers.map((designer) => (
          <Card key={designer.id} className={!designer.isActive ? 'opacity-50' : ''}>
            <CardContent className="flex items-center gap-4 p-4">
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab shrink-0" />
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-brand-light text-brand font-semibold">
                  {designer.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{designer.name}</h3>
                  <Badge variant="secondary" className="text-[10px]">{designer.title}</Badge>
                  {!designer.isActive && <Badge variant="outline" className="text-[10px]">비활성</Badge>}
                </div>
                <p className="text-sm text-muted-foreground truncate">{designer.introduction}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(designer)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => toggleActive(designer.id)}>
                  <span className={`text-xs ${designer.isActive ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {designer.isActive ? 'ON' : 'OFF'}
                  </span>
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(designer.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTarget ? '디자이너 수정' : '디자이너 추가'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>이름</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="홍길동" />
            </div>
            <div className="space-y-2">
              <Label>직급</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="원장, 실장, 디자이너 등" />
            </div>
            <div className="space-y-2">
              <Label>소개</Label>
              <Textarea value={form.introduction} onChange={e => setForm(f => ({ ...f, introduction: e.target.value }))} placeholder="간단한 소개" rows={2} />
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
