'use client'

import { use, useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight, Check, Clock, Calendar, CreditCard } from 'lucide-react'
import { format, addDays, isSameDay } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Shop, Designer, Menu } from '@/types'

const ALL_TIMES = Array.from({ length: 26 }, (_, i) => {
  const h = Math.floor(i / 2) + 9
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
}).filter(t => t <= '20:30')

type Step = 'menu' | 'designer' | 'datetime' | 'confirm'

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [shop, setShop] = useState<Shop | null>(null)
  const [designers, setDesigners] = useState<Designer[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [step, setStep] = useState<Step>('menu')
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null)
  const [selectedDesigner, setSelectedDesigner] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [dateOffset, setDateOffset] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const [s, d, m] = await Promise.all([
        supabase.from('shops').select('*').eq('id', id).single(),
        supabase.from('designers').select('*').eq('shop_id', id).eq('is_active', true).order('sort_order'),
        supabase.from('menus').select('*').eq('shop_id', id).eq('is_active', true).order('sort_order'),
      ])
      setShop(s.data as Shop | null)
      setDesigners((d.data as Designer[]) || [])
      setMenus((m.data as Menu[]) || [])
      setLoading(false)
    }
    fetch()
  }, [id])

  // 선택한 날짜+디자이너의 예약 상태 조회
  useEffect(() => {
    if (!selectedDate || !selectedDesigner) return
    const fetchSlots = async () => {
      const supabase = createClient()
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const { data } = await supabase
        .from('reservations')
        .select('start_time, end_time')
        .eq('designer_id', selectedDesigner)
        .eq('date', dateStr)
        .in('status', ['confirmed', 'blocked'])
      const booked: string[] = []
      data?.forEach(r => {
        ALL_TIMES.forEach(t => {
          if (t >= r.start_time?.slice(0, 5) && t < r.end_time?.slice(0, 5)) booked.push(t)
        })
      })
      setBookedSlots(booked)
    }
    fetchSlots()
  }, [selectedDate, selectedDesigner])

  const menu = menus.find(m => m.id === selectedMenu)
  const designer = designers.find(d => d.id === selectedDesigner)
  const today = new Date()
  const dates = Array.from({ length: 7 }, (_, i) => addDays(today, i + dateOffset))
  const price = menu ? (menu.discount_price ?? menu.price) : 0

  const availableTimes = useMemo(() => {
    if (!selectedDate) return []
    return ALL_TIMES.map(t => ({ time: t, available: !bookedSlots.includes(t) }))
  }, [selectedDate, bookedSlots])

  const handleConfirm = async () => {
    if (!menu || !designer || !selectedDate || !selectedTime || !shop) return
    setSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('로그인이 필요합니다.')
      setSubmitting(false)
      return
    }

    const endTimeIdx = ALL_TIMES.indexOf(selectedTime) + Math.ceil(menu.duration / 30)
    const endTime = ALL_TIMES[endTimeIdx] || '21:00'

    const { error } = await supabase.from('reservations').insert({
      shop_id: shop.id,
      designer_id: designer.id,
      customer_id: user.id,
      menu_id: menu.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      start_time: selectedTime,
      end_time: endTime,
      status: 'confirmed',
      source: 'mimiall',
      total_price: price,
    })

    if (error) {
      toast.error('예약 실패: ' + error.message)
      setSubmitting(false)
      return
    }

    toast.success('예약이 완료되었습니다!')
    setSubmitting(false)
    window.location.href = '/my/bookings'
  }

  if (loading) {
    return <div className="max-w-lg mx-auto px-4 py-8 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 rounded-xl" /></div>
  }

  if (!shop || menus.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">예약할 수 있는 메뉴가 없습니다</p>
        <Link href={`/shop/${id}`}><Button variant="outline" className="mt-4">돌아가기</Button></Link>
      </div>
    )
  }

  const steps: { key: Step; label: string }[] = [
    { key: 'menu', label: '시술' }, { key: 'designer', label: '디자이너' },
    { key: 'datetime', label: '일시' }, { key: 'confirm', label: '확인' },
  ]
  const stepIdx = steps.findIndex(s => s.key === step)

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-32">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/shop/${id}`}><Button variant="ghost" size="icon"><ChevronLeft className="w-5 h-5" /></Button></Link>
        <div><h1 className="text-lg font-bold">예약하기</h1><p className="text-xs text-muted-foreground">{shop.name}</p></div>
      </div>

      {/* 스텝 */}
      <div className="flex items-center gap-1 mb-8">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${i <= stepIdx ? 'bg-brand text-white' : 'bg-muted text-muted-foreground'}`}>
              {i < stepIdx ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`ml-1.5 text-xs font-medium hidden sm:block ${i <= stepIdx ? 'text-brand' : 'text-muted-foreground'}`}>{s.label}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 rounded ${i < stepIdx ? 'bg-brand' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 'menu' && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold mb-4">시술을 선택해주세요</h2>
          {menus.map(m => (
            <button key={m.id} onClick={() => { setSelectedMenu(m.id); setStep('designer') }}
              className="w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left hover:bg-muted/50">
              <div>
                <h3 className="font-medium">{m.name}</h3>
                <span className="flex items-center gap-2 text-xs text-muted-foreground mt-1"><Clock className="w-3 h-3" /> {m.duration}분</span>
              </div>
              <div className="text-right">
                {m.discount_price ? (
                  <div><span className="text-xs text-muted-foreground line-through">{m.price.toLocaleString()}</span><p className="text-brand font-bold">{m.discount_price.toLocaleString()}원</p></div>
                ) : (<p className="font-bold">{m.price.toLocaleString()}원</p>)}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 2 */}
      {step === 'designer' && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold mb-4">디자이너를 선택해주세요</h2>
          {designers.map(d => (
            <button key={d.id} onClick={() => { setSelectedDesigner(d.id); setStep('datetime') }}
              className="w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left hover:bg-muted/50">
              <Avatar className="w-12 h-12"><AvatarFallback className="bg-brand-light text-brand font-bold">{d.name[0]}</AvatarFallback></Avatar>
              <div><div className="flex items-center gap-2"><h3 className="font-semibold">{d.name}</h3>{d.title && <Badge variant="secondary" className="text-[10px]">{d.title}</Badge>}</div></div>
            </button>
          ))}
          <Button variant="ghost" className="w-full mt-2" onClick={() => setStep('menu')}><ChevronLeft className="w-4 h-4 mr-1" /> 이전</Button>
        </div>
      )}

      {/* Step 3 */}
      {step === 'datetime' && (
        <div>
          <h2 className="text-lg font-bold mb-4">날짜와 시간을 선택해주세요</h2>
          <div className="flex items-center gap-2 mb-6">
            <button onClick={() => setDateOffset(o => Math.max(0, o - 7))} className="p-2 rounded-lg hover:bg-muted" disabled={dateOffset === 0}><ChevronLeft className="w-4 h-4" /></button>
            <div className="flex-1 flex gap-1.5 overflow-x-auto">
              {dates.map(date => {
                const isSelected = selectedDate && isSameDay(date, selectedDate)
                return (
                  <button key={date.toISOString()} onClick={() => { setSelectedDate(date); setSelectedTime(null) }}
                    className={`flex-1 min-w-[52px] py-3 rounded-xl text-center transition-all ${isSelected ? 'bg-brand text-white shadow-md' : isSameDay(date, today) ? 'bg-brand/10 text-brand' : 'hover:bg-muted'}`}>
                    <p className="text-[10px] font-medium">{format(date, 'EEE', { locale: ko })}</p>
                    <p className="text-lg font-bold">{format(date, 'd')}</p>
                  </button>
                )
              })}
            </div>
            <button onClick={() => setDateOffset(o => o + 7)} className="p-2 rounded-lg hover:bg-muted"><ChevronRight className="w-4 h-4" /></button>
          </div>

          {selectedDate && (
            <div>
              <h3 className="font-medium text-sm mb-3">{format(selectedDate, 'M월 d일 (EEE)', { locale: ko })} 예약 가능 시간</h3>
              <div className="grid grid-cols-4 gap-2">
                {availableTimes.map(({ time, available }) => (
                  <button key={time} disabled={!available} onClick={() => setSelectedTime(time)}
                    className={`py-2.5 rounded-lg text-sm font-medium transition-all ${selectedTime === time ? 'bg-brand text-white shadow-md' : available ? 'bg-muted hover:bg-brand/10 hover:text-brand' : 'bg-muted/30 text-muted-foreground/30 cursor-not-allowed line-through'}`}>
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-6">
            <Button variant="ghost" className="flex-1" onClick={() => setStep('designer')}><ChevronLeft className="w-4 h-4 mr-1" /> 이전</Button>
            <Button className="flex-1 bg-brand hover:bg-brand-dark text-white" disabled={!selectedTime} onClick={() => setStep('confirm')}>다음</Button>
          </div>
        </div>
      )}

      {/* Step 4 */}
      {step === 'confirm' && menu && designer && selectedDate && selectedTime && (
        <div>
          <h2 className="text-lg font-bold mb-4">예약 정보 확인</h2>
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">매장</span><span className="text-sm font-medium">{shop.name}</span></div>
              <Separator />
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">시술</span><span className="text-sm font-medium">{menu.name}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">디자이너</span><span className="text-sm font-medium">{designer.name} {designer.title}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">날짜</span><span className="text-sm font-medium">{format(selectedDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">시간</span><span className="text-sm font-medium">{selectedTime}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">소요시간</span><span className="text-sm font-medium">{menu.duration}분</span></div>
              <Separator />
              <div className="flex items-center justify-between"><span className="text-sm font-medium">결제 금액</span><span className="text-xl font-bold text-brand">{price.toLocaleString()}원</span></div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <h3 className="font-medium text-sm mb-3">결제 수단</h3>
            <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-brand bg-brand/5">
              <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center"><span className="text-white font-bold text-xs">P3</span></div>
              <div className="flex-1"><p className="font-medium text-sm">Point3 간편결제</p><p className="text-xs text-brand">수수료 0.3%</p></div>
              <Check className="w-5 h-5 text-brand" />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button variant="ghost" className="flex-1" onClick={() => setStep('datetime')}><ChevronLeft className="w-4 h-4 mr-1" /> 이전</Button>
            <Button className="flex-1 h-12 bg-brand hover:bg-brand-dark text-white text-base font-semibold" onClick={handleConfirm} disabled={submitting}>
              {submitting ? '처리 중...' : `${price.toLocaleString()}원 예약하기`}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
