'use client'

import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight, Lock, Unlock, X, Phone, Globe, UserCheck, Clock, Plus } from 'lucide-react'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import type { ReservationSource, ReservationStatus } from '@/types'

const TIME_SLOTS = Array.from({ length: 26 }, (_, i) => {
  const h = Math.floor(i / 2) + 9
  const m = i % 2 === 0 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
}).filter(t => t <= '21:00')

const SOURCE_ICON: Record<string, React.ReactNode> = {
  mimiall: <Globe className="w-3.5 h-3.5 text-brand" />,
  naver: <span className="text-[10px] font-bold text-green-600">N</span>,
  phone: <Phone className="w-3.5 h-3.5 text-blue-500" />,
  walkin: <UserCheck className="w-3.5 h-3.5 text-purple-500" />,
  other: <Clock className="w-3.5 h-3.5 text-gray-400" />,
}

const SOURCE_LABEL: Record<string, string> = {
  mimiall: '미미올', naver: '네이버', phone: '전화', walkin: '워크인', other: '기타',
}

export default function CalendarPage() {
  const { user } = useAuth()
  const [shopId, setShopId] = useState<string | null>(null)
  const [designers, setDesigners] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDesigner, setSelectedDesigner] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'block' | 'detail'>('block')
  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [clickedTime, setClickedTime] = useState({ date: '', time: '', designerId: '' })
  const [blockForm, setBlockForm] = useState({
    source: 'other' as ReservationSource, memo: '',
    customerName: '', customerPhone: '', menuName: '', endTime: '',
  })

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const fetchData = useCallback(async () => {
    if (!user) return
    const supabase = createClient()
    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
    if (!shop) { setLoading(false); return }
    setShopId(shop.id)

    const { data: d } = await supabase.from('designers').select('*').eq('shop_id', shop.id).eq('is_active', true).order('sort_order')
    setDesigners(d || [])

    const startDate = format(weekDays[0], 'yyyy-MM-dd')
    const endDate = format(weekDays[6], 'yyyy-MM-dd')
    const { data: r } = await supabase
      .from('reservations')
      .select('*, designer:designers(name), menu:menus(name), customer:users(name)')
      .eq('shop_id', shop.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .neq('status', 'cancelled')
    setReservations(r || [])
    setLoading(false)
  }, [user, currentDate])

  useEffect(() => { fetchData() }, [fetchData])

  const filteredDesigners = selectedDesigner === 'all' ? designers : designers.filter(d => d.id === selectedDesigner)

  const getSlotForCell = (designerId: string, date: string, time: string) => {
    return reservations.find(r =>
      r.designer_id === designerId && r.date === date &&
      r.start_time?.slice(0, 5) <= time && r.end_time?.slice(0, 5) > time
    )
  }

  const isSlotStart = (designerId: string, date: string, time: string) => {
    return reservations.find(r =>
      r.designer_id === designerId && r.date === date && r.start_time?.slice(0, 5) === time
    )
  }

  const getSlotSpan = (slot: any) => {
    const startIdx = TIME_SLOTS.indexOf(slot.start_time?.slice(0, 5))
    const endIdx = TIME_SLOTS.indexOf(slot.end_time?.slice(0, 5))
    return Math.max(endIdx - startIdx, 1)
  }

  const handleEmptyClick = (designerId: string, date: string, time: string) => {
    setClickedTime({ date, time, designerId })
    const timeIdx = TIME_SLOTS.indexOf(time)
    setBlockForm({ source: 'other', memo: '', customerName: '', customerPhone: '', menuName: '', endTime: TIME_SLOTS[timeIdx + 1] || '21:00' })
    setDialogMode('block')
    setDialogOpen(true)
  }

  const handleSlotClick = (slot: any) => {
    setSelectedSlot(slot)
    setDialogMode('detail')
    setDialogOpen(true)
  }

  const handleSaveBlock = async () => {
    if (!shopId) return
    const supabase = createClient()
    const isBlock = blockForm.source === 'other' && !blockForm.customerName
    const { error } = await supabase.from('reservations').insert({
      shop_id: shopId,
      designer_id: clickedTime.designerId,
      date: clickedTime.date,
      start_time: clickedTime.time,
      end_time: blockForm.endTime,
      status: isBlock ? 'blocked' : 'confirmed',
      source: blockForm.source,
      customer_name: blockForm.customerName || null,
      customer_phone: blockForm.customerPhone || null,
      block_memo: blockForm.memo || null,
    })
    if (error) { toast.error('저장 실패: ' + error.message); return }
    setDialogOpen(false)
    toast.success(isBlock ? '블록 처리되었습니다.' : '수기 예약이 등록되었습니다.')
    fetchData()
  }

  const handleCancelSlot = async (slotId: string) => {
    const supabase = createClient()
    await supabase.from('reservations').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('id', slotId)
    setDialogOpen(false)
    toast.success('해제되었습니다.')
    fetchData()
  }

  const handleComplete = async (slotId: string) => {
    const supabase = createClient()
    await supabase.from('reservations').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', slotId)
    setDialogOpen(false)
    toast.success('시술 완료 처리되었습니다.')
    fetchData()
  }

  if (loading) {
    return <div className="p-4 lg:p-8 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-[600px] rounded-xl" /></div>
  }

  if (designers.length === 0) {
    return (
      <div className="p-6 lg:p-8 text-center py-20">
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold">디자이너를 먼저 등록해주세요</h2>
        <p className="text-muted-foreground mt-2 text-sm">캘린더는 디자이너별로 관리됩니다</p>
        <a href="/dashboard/designers" className="inline-flex items-center mt-4 px-6 py-3 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark transition-colors">디자이너 등록하기</a>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">예약 캘린더</h1>
          <p className="text-sm text-muted-foreground mt-1">빈 셀 클릭 → 블록/수기예약 · 예약 셀 클릭 → 상세</p>
        </div>
        <Select value={selectedDesigner} onValueChange={v => v && setSelectedDesigner(v)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 디자이너</SelectItem>
            {designers.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => setCurrentDate(d => addDays(d, -7))}><ChevronLeft className="w-5 h-5" /></Button>
        <h2 className="text-lg font-semibold">{format(weekDays[0], 'M월 d일', { locale: ko })} — {format(weekDays[6], 'M월 d일', { locale: ko })}</h2>
        <Button variant="ghost" size="icon" onClick={() => setCurrentDate(d => addDays(d, 7))}><ChevronRight className="w-5 h-5" /></Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-brand/20 border border-brand/40" /> 미미올</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 border border-green-300" /> 네이버</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-300" /> 전화/워크인</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-400" /> 블록</span>
      </div>

      {filteredDesigners.map((designer: any) => (
        <Card key={designer.id} className="mb-6">
          <CardHeader className="py-3 px-4"><CardTitle className="text-sm font-semibold">{designer.name} {designer.title && `(${designer.title})`}</CardTitle></CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
                <div className="p-2 text-xs text-muted-foreground text-center">시간</div>
                {weekDays.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const isToday = isSameDay(day, new Date())
                  return (
                    <div key={dateStr} className={`p-2 text-center border-l ${isToday ? 'bg-brand/5' : ''}`}>
                      <p className={`text-xs ${isToday ? 'text-brand font-bold' : 'text-muted-foreground'}`}>{format(day, 'EEE', { locale: ko })}</p>
                      <p className={`text-sm font-semibold ${isToday ? 'text-brand' : ''}`}>{format(day, 'd')}</p>
                    </div>
                  )
                })}
              </div>
              {TIME_SLOTS.map(time => (
                <div key={time} className="grid grid-cols-[60px_repeat(7,1fr)] border-b last:border-0 min-h-[40px]">
                  <div className="p-1 text-[11px] text-muted-foreground text-center flex items-center justify-center font-mono">{time}</div>
                  {weekDays.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const slotStart = isSlotStart(designer.id, dateStr, time)
                    const slotCover = getSlotForCell(designer.id, dateStr, time)
                    const isToday = isSameDay(day, new Date())

                    if (slotCover && !slotStart) return <div key={dateStr} className={`border-l ${isToday ? 'bg-brand/5' : ''}`} />

                    if (slotStart) {
                      const span = getSlotSpan(slotStart)
                      const bgColor = slotStart.status === 'blocked' ? 'bg-amber-50 border-amber-300 hover:bg-amber-100'
                        : slotStart.status === 'completed' ? 'bg-gray-50 border-gray-200'
                        : slotStart.source === 'mimiall' ? 'bg-brand/10 border-brand/30 hover:bg-brand/20'
                        : slotStart.source === 'naver' ? 'bg-green-50 border-green-200 hover:bg-green-100'
                        : 'bg-blue-50 border-blue-200 hover:bg-blue-100'

                      return (
                        <div key={dateStr} className={`border-l relative ${isToday ? 'bg-brand/5' : ''}`}>
                          <button onClick={() => handleSlotClick(slotStart)}
                            className={`absolute inset-x-0.5 top-0.5 rounded-md border px-1.5 py-0.5 text-left cursor-pointer transition-colors ${bgColor}`}
                            style={{ height: `calc(${span * 40}px - 4px)` }}>
                            <div className="flex items-center gap-1">
                              {slotStart.status === 'blocked' ? <Lock className="w-3 h-3 text-amber-600" /> : SOURCE_ICON[slotStart.source]}
                              <span className="text-[10px] font-medium truncate">
                                {slotStart.status === 'blocked' ? (slotStart.block_memo || '블록')
                                  : slotStart.customer_name || slotStart.customer?.name || '고객'}
                              </span>
                            </div>
                            {slotStart.menu?.name && <p className="text-[9px] text-muted-foreground truncate mt-0.5">{slotStart.menu.name}</p>}
                          </button>
                        </div>
                      )
                    }
                    return <div key={dateStr} className={`border-l cursor-pointer hover:bg-muted/50 transition-colors ${isToday ? 'bg-brand/5' : ''}`} onClick={() => handleEmptyClick(designer.id, dateStr, time)} />
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* 다이얼로그 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          {dialogMode === 'block' && (
            <>
              <DialogHeader>
                <DialogTitle>시간대 관리</DialogTitle>
                <DialogDescription>{clickedTime.date} {clickedTime.time}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>유형</Label>
                  <Select value={blockForm.source} onValueChange={v => v && setBlockForm(f => ({ ...f, source: v as ReservationSource }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="other">블록 (예약 불가)</SelectItem>
                      <SelectItem value="naver">네이버 예약 (수기)</SelectItem>
                      <SelectItem value="phone">전화 예약 (수기)</SelectItem>
                      <SelectItem value="walkin">워크인 (수기)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>종료 시간</Label>
                  <Select value={blockForm.endTime} onValueChange={v => v && setBlockForm(f => ({ ...f, endTime: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TIME_SLOTS.filter(t => t > clickedTime.time).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {blockForm.source !== 'other' && (
                  <>
                    <div><Label>고객명</Label><Input value={blockForm.customerName} onChange={e => setBlockForm(f => ({ ...f, customerName: e.target.value }))} placeholder="고객 이름" /></div>
                    <div><Label>연락처</Label><Input value={blockForm.customerPhone} onChange={e => setBlockForm(f => ({ ...f, customerPhone: e.target.value }))} placeholder="010-0000-0000" /></div>
                  </>
                )}
                <div><Label>메모</Label><Textarea value={blockForm.memo} onChange={e => setBlockForm(f => ({ ...f, memo: e.target.value }))} placeholder="사유 또는 메모 (선택)" rows={2} /></div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>취소</Button>
                  <Button className="flex-1 bg-brand hover:bg-brand-dark text-white" onClick={handleSaveBlock}>
                    {blockForm.source === 'other' && !blockForm.customerName ? <><Lock className="w-4 h-4 mr-1" /> 블록</> : <><Plus className="w-4 h-4 mr-1" /> 수기 예약</>}
                  </Button>
                </div>
              </div>
            </>
          )}
          {dialogMode === 'detail' && selectedSlot && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedSlot.status === 'blocked' ? '블록 상세' : '예약 상세'}</DialogTitle>
                <DialogDescription>{selectedSlot.date} {selectedSlot.start_time?.slice(0,5)} ~ {selectedSlot.end_time?.slice(0,5)}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">상태</span><Badge>{selectedSlot.status === 'blocked' ? '블록' : selectedSlot.status === 'completed' ? '완료' : '확정'}</Badge></div>
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">유입</span><span className="flex items-center gap-1 text-sm">{SOURCE_ICON[selectedSlot.source]} {SOURCE_LABEL[selectedSlot.source]}</span></div>
                {(selectedSlot.customer_name || selectedSlot.customer?.name) && <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">고객</span><span className="text-sm font-medium">{selectedSlot.customer_name || selectedSlot.customer?.name}</span></div>}
                {selectedSlot.menu?.name && <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">시술</span><span className="text-sm">{selectedSlot.menu.name}</span></div>}
                {selectedSlot.designer?.name && <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">디자이너</span><span className="text-sm">{selectedSlot.designer.name}</span></div>}
                {selectedSlot.block_memo && <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">메모</span><span className="text-sm">{selectedSlot.block_memo}</span></div>}
                <div className="flex gap-2 pt-3 border-t">
                  {selectedSlot.status === 'blocked' && <Button variant="outline" className="flex-1" onClick={() => handleCancelSlot(selectedSlot.id)}><Unlock className="w-4 h-4 mr-1" /> 블록 해제</Button>}
                  {selectedSlot.status === 'confirmed' && (
                    <>
                      <Button variant="outline" className="flex-1 text-destructive" onClick={() => handleCancelSlot(selectedSlot.id)}><X className="w-4 h-4 mr-1" /> 취소</Button>
                      <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleComplete(selectedSlot.id)}>완료 처리</Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
