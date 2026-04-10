'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Camera, Clock, MapPin, Phone, Save } from 'lucide-react'
import { SHOP_CATEGORIES, DAY_LABELS, type DayOfWeek } from '@/types'

const DEFAULT_HOURS: Record<DayOfWeek, { open: string; close: string; closed: boolean }> = {
  mon: { open: '10:00', close: '20:00', closed: false },
  tue: { open: '10:00', close: '20:00', closed: false },
  wed: { open: '10:00', close: '20:00', closed: false },
  thu: { open: '10:00', close: '20:00', closed: false },
  fri: { open: '10:00', close: '21:00', closed: false },
  sat: { open: '10:00', close: '21:00', closed: false },
  sun: { open: '10:00', close: '18:00', closed: true },
}

export default function ShopManagePage() {
  const [form, setForm] = useState({
    name: '루미에르 헤어',
    category: 'hair',
    phone: '02-1234-5678',
    address: '서울시 강남구 신사동 123-45',
    addressDetail: '2층',
    description: '루미에르 헤어는 트렌디한 스타일링과 편안한 분위기를 제공하는 프리미엄 헤어살롱입니다.',
    slotDuration: 30,
  })
  const [hours, setHours] = useState(DEFAULT_HOURS)

  const handleSave = () => {
    toast.success('샵 정보가 저장되었습니다.')
  }

  const updateHour = (day: DayOfWeek, field: string, value: string | boolean) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">샵 정보 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">매장 기본 정보 및 영업시간 설정</p>
        </div>
        <Badge variant="secondary">승인됨</Badge>
      </div>

      {/* 기본 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 썸네일 */}
          <div>
            <Label>대표 이미지</Label>
            <div className="mt-2 flex gap-3">
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-brand-light to-muted flex items-center justify-center border-2 border-dashed border-brand/30 cursor-pointer hover:border-brand/60 transition-colors">
                <Camera className="w-6 h-6 text-brand/50" />
              </div>
              {[1,2,3].map(i => (
                <div key={i} className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center border-2 border-dashed border-border cursor-pointer hover:border-muted-foreground/30 transition-colors">
                  <span className="text-xs text-muted-foreground">+</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>상호명</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select value={form.category} onValueChange={v => v && setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SHOP_CATEGORIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>전화번호</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>주소</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <Input placeholder="상세주소" value={form.addressDetail} onChange={e => setForm(f => ({ ...f, addressDetail: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <Label>소개</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
          </div>

          <div className="space-y-2">
            <Label>예약 슬롯 단위</Label>
            <Select value={String(form.slotDuration)} onValueChange={v => v && setForm(f => ({ ...f, slotDuration: Number(v) }))}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15분</SelectItem>
                <SelectItem value="30">30분</SelectItem>
                <SelectItem value="60">60분</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 영업시간 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" /> 영업시간
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(Object.entries(hours) as [DayOfWeek, typeof hours['mon']][]).map(([day, h]) => (
              <div key={day} className="flex items-center gap-3">
                <span className="w-8 text-sm font-medium">{DAY_LABELS[day]}</span>
                <Switch
                  checked={!h.closed}
                  onCheckedChange={(v) => updateHour(day, 'closed', !v)}
                />
                {h.closed ? (
                  <span className="text-sm text-muted-foreground">휴무</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      className="w-32"
                      value={h.open}
                      onChange={e => updateHour(day, 'open', e.target.value)}
                    />
                    <span className="text-muted-foreground">~</span>
                    <Input
                      type="time"
                      className="w-32"
                      value={h.close}
                      onChange={e => updateHour(day, 'close', e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button className="w-full bg-brand hover:bg-brand-dark text-white h-12" onClick={handleSave}>
        <Save className="w-4 h-4 mr-2" /> 저장하기
      </Button>
    </div>
  )
}
