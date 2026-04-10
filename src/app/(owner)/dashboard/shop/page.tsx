'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Camera, Clock, MapPin, Phone, Save, Store } from 'lucide-react'
import { SHOP_CATEGORIES, DAY_LABELS, type DayOfWeek } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'

const DAYS: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
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
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [shopId, setShopId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', category: 'hair', phone: '', address: '',
    address_detail: '', description: '', slot_duration: 30,
  })
  const [hours, setHours] = useState(DEFAULT_HOURS)

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const supabase = createClient()
      const { data: shop } = await supabase.from('shops').select('*').eq('owner_id', user.id).single()
      if (shop) {
        setShopId(shop.id)
        setForm({
          name: shop.name, category: shop.category, phone: shop.phone || '',
          address: shop.address, address_detail: shop.address_detail || '',
          description: shop.description || '', slot_duration: shop.slot_duration,
        })
        const { data: shopHours } = await supabase.from('shop_hours').select('*').eq('shop_id', shop.id)
        if (shopHours && shopHours.length > 0) {
          const h = { ...DEFAULT_HOURS }
          shopHours.forEach((sh: any) => {
            h[sh.day as DayOfWeek] = {
              open: sh.open_time?.slice(0, 5) || '10:00',
              close: sh.close_time?.slice(0, 5) || '20:00',
              closed: sh.is_closed,
            }
          })
          setHours(h)
        }
      }
      setLoading(false)
    }
    fetch()
  }, [user])

  const handleSave = async () => {
    if (!user) return
    if (!form.name.trim() || !form.address.trim()) {
      toast.error('상호명과 주소는 필수입니다.')
      return
    }
    setSaving(true)
    const supabase = createClient()

    const shopPayload = {
      owner_id: user.id,
      name: form.name,
      category: form.category,
      phone: form.phone || null,
      address: form.address,
      address_detail: form.address_detail || null,
      description: form.description || null,
      slot_duration: form.slot_duration,
    }

    let currentShopId = shopId

    if (shopId) {
      await supabase.from('shops').update(shopPayload).eq('id', shopId)
    } else {
      const { data: newShop } = await supabase.from('shops').insert({
        ...shopPayload, status: 'pending',
      }).select().single()
      if (newShop) {
        currentShopId = newShop.id
        setShopId(newShop.id)
      }
    }

    if (currentShopId) {
      await supabase.from('shop_hours').delete().eq('shop_id', currentShopId)
      const hoursData = DAYS.map(day => ({
        shop_id: currentShopId!,
        day,
        open_time: hours[day].open,
        close_time: hours[day].close,
        is_closed: hours[day].closed,
      }))
      await supabase.from('shop_hours').insert(hoursData)
    }

    setSaving(false)
    toast.success(shopId ? '샵 정보가 저장되었습니다.' : '샵이 등록되었습니다! 관리자 승인 후 노출됩니다.')
  }

  const updateHour = (day: DayOfWeek, field: string, value: string | boolean) => {
    setHours(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }))
  }

  if (loading) {
    return <div className="p-6 lg:p-8 max-w-3xl space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 rounded-xl" /></div>
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{shopId ? '샵 정보 관리' : '새 샵 등록'}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {shopId ? '매장 기본 정보 및 영업시간 설정' : '매장 정보를 입력하고 입점 신청하세요'}
          </p>
        </div>
        {shopId && <Badge variant="secondary">등록됨</Badge>}
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">기본 정보</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>상호명 *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="우리 미용실" />
            </div>
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select value={form.category} onValueChange={v => v && setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SHOP_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>전화번호</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="02-1234-5678" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>주소 *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="서울시 강남구 신사동 123-45" />
            </div>
            <Input placeholder="상세주소 (층, 호수 등)" value={form.address_detail} onChange={e => setForm(f => ({ ...f, address_detail: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <Label>소개</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="우리 매장을 소개해주세요" />
          </div>

          <div className="space-y-2">
            <Label>예약 슬롯 단위</Label>
            <Select value={String(form.slot_duration)} onValueChange={v => v && setForm(f => ({ ...f, slot_duration: Number(v) }))}>
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4" /> 영업시간</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DAYS.map(day => (
              <div key={day} className="flex items-center gap-3">
                <span className="w-8 text-sm font-medium">{DAY_LABELS[day]}</span>
                <Switch checked={!hours[day].closed} onCheckedChange={v => updateHour(day, 'closed', !v)} />
                {hours[day].closed ? (
                  <span className="text-sm text-muted-foreground">휴무</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input type="time" className="w-32" value={hours[day].open} onChange={e => updateHour(day, 'open', e.target.value)} />
                    <span className="text-muted-foreground">~</span>
                    <Input type="time" className="w-32" value={hours[day].close} onChange={e => updateHour(day, 'close', e.target.value)} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button className="w-full bg-brand hover:bg-brand-dark text-white h-12" onClick={handleSave} disabled={saving}>
        <Save className="w-4 h-4 mr-2" /> {saving ? '저장 중...' : shopId ? '저장하기' : '입점 신청하기'}
      </Button>
    </div>
  )
}
