'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  ChevronLeft, ChevronRight, Lock, Unlock, X,
  Phone, Globe, UserCheck, Clock, Plus,
} from 'lucide-react'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toast } from 'sonner'
import type { ReservationSource, ReservationStatus } from '@/types'

// 데모 디자이너
const DESIGNERS = [
  { id: 'd1', name: '김수진 원장' },
  { id: 'd2', name: '박서윤 실장' },
]

const TIME_SLOTS = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30',
  '18:00','18:30','19:00','19:30','20:00',
]

interface SlotData {
  id: string
  designerId: string
  date: string
  startTime: string
  endTime: string
  status: ReservationStatus
  source: ReservationSource
  customerName?: string
  customerPhone?: string
  menuName?: string
  memo?: string
}

// 데모 예약 데이터
const INITIAL_SLOTS: SlotData[] = [
  { id: 's1', designerId: 'd1', date: '2026-04-10', startTime: '10:00', endTime: '11:00', status: 'confirmed', source: 'mimiall', customerName: '김지연', menuName: '커트 + 셋팅' },
  { id: 's2', designerId: 'd2', date: '2026-04-10', startTime: '11:00', endTime: '12:30', status: 'confirmed', source: 'naver', customerName: '네이버 이OO', menuName: '염색' },
  { id: 's3', designerId: 'd1', date: '2026-04-10', startTime: '13:00', endTime: '14:00', status: 'blocked', source: 'other', memo: '점심 휴식' },
  { id: 's4', designerId: 'd1', date: '2026-04-10', startTime: '14:00', endTime: '15:30', status: 'confirmed', source: 'mimiall', customerName: '최민서', menuName: '디지털 펌' },
  { id: 's5', designerId: 'd1', date: '2026-04-11', startTime: '10:00', endTime: '11:00', status: 'confirmed', source: 'phone', customerName: '전화 박OO', menuName: '커트' },
  { id: 's6', designerId: 'd2', date: '2026-04-11', startTime: '14:00', endTime: '15:00', status: 'confirmed', source: 'mimiall', customerName: '정유진', menuName: '클리닉' },
]

const SOURCE_ICON = {
  mimiall: <Globe className="w-3.5 h-3.5 text-brand" />,
  naver: <span className="text-[10px] font-bold text-green-600">N</span>,
  phone: <Phone className="w-3.5 h-3.5 text-blue-500" />,
  walkin: <UserCheck className="w-3.5 h-3.5 text-purple-500" />,
  other: <Clock className="w-3.5 h-3.5 text-gray-400" />,
}

const SOURCE_LABEL: Record<ReservationSource, string> = {
  mimiall: '미미올', naver: '네이버', phone: '전화', walkin: '워크인', other: '기타',
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 10))
  const [selectedDesigner, setSelectedDesigner] = useState('all')
  const [slots, setSlots] = useState<SlotData[]>(INITIAL_SLOTS)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'block' | 'detail' | 'manual'>('block')
  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null)
  const [clickedTime, setClickedTime] = useState({ date: '', time: '', designerId: '' })

  // 블록 폼
  const [blockForm, setBlockForm] = useState({
    source: 'other' as ReservationSource,
    memo: '',
    customerName: '',
    customerPhone: '',
    menuName: '',
    endTime: '',
  })

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const filteredDesigners = selectedDesigner === 'all'
    ? DESIGNERS
    : DESIGNERS.filter(d => d.id === selectedDesigner)

  const getSlotForCell = (designerId: string, date: string, time: string) => {
    return slots.find(
      s => s.designerId === designerId
        && s.date === date
        && s.startTime <= time
        && s.endTime > time
        && s.status !== 'cancelled'
    )
  }

  const isSlotStart = (designerId: string, date: string, time: string) => {
    return slots.find(
      s => s.designerId === designerId && s.date === date && s.startTime === time && s.status !== 'cancelled'
    )
  }

  const getSlotSpan = (slot: SlotData) => {
    const startIdx = TIME_SLOTS.indexOf(slot.startTime)
    const endIdx = TIME_SLOTS.indexOf(slot.endTime)
    return endIdx - startIdx
  }

  // 빈 슬롯 클릭 → 블록/수기예약 다이얼로그
  const handleEmptyClick = (designerId: string, date: string, time: string) => {
    setClickedTime({ date, time, designerId })
    const timeIdx = TIME_SLOTS.indexOf(time)
    const nextTime = TIME_SLOTS[timeIdx + 1] || '21:00'
    setBlockForm({
      source: 'other',
      memo: '',
      customerName: '',
      customerPhone: '',
      menuName: '',
      endTime: nextTime,
    })
    setDialogMode('block')
    setDialogOpen(true)
  }

  // 예약 슬롯 클릭 → 상세 보기
  const handleSlotClick = (slot: SlotData) => {
    setSelectedSlot(slot)
    setDialogMode('detail')
    setDialogOpen(true)
  }

  // 블록/수기예약 저장
  const handleSaveBlock = () => {
    const newSlot: SlotData = {
      id: `s${Date.now()}`,
      designerId: clickedTime.designerId,
      date: clickedTime.date,
      startTime: clickedTime.time,
      endTime: blockForm.endTime,
      status: blockForm.source === 'other' && !blockForm.customerName ? 'blocked' : 'confirmed',
      source: blockForm.source,
      customerName: blockForm.customerName || undefined,
      customerPhone: blockForm.customerPhone || undefined,
      menuName: blockForm.menuName || undefined,
      memo: blockForm.memo || undefined,
    }
    setSlots(prev => [...prev, newSlot])
    setDialogOpen(false)
    toast.success(
      newSlot.status === 'blocked' ? '시간대가 블록 처리되었습니다.' : '수기 예약이 등록되었습니다.'
    )
  }

  // 블록 해제 / 예약 취소
  const handleCancelSlot = (slotId: string) => {
    setSlots(prev => prev.map(s =>
      s.id === slotId ? { ...s, status: 'cancelled' as const } : s
    ))
    setDialogOpen(false)
    toast.success('해제되었습니다.')
  }

  // 완료 처리
  const handleComplete = (slotId: string) => {
    setSlots(prev => prev.map(s =>
      s.id === slotId ? { ...s, status: 'completed' as const } : s
    ))
    setDialogOpen(false)
    toast.success('시술 완료 처리되었습니다.')
  }

  return (
    <div className="p-4 lg:p-8">
      {/* 상단 컨트롤 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">예약 캘린더</h1>
          <p className="text-sm text-muted-foreground mt-1">
            빈 셀을 클릭하여 블록/수기예약, 예약 셀을 클릭하여 상세 확인
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedDesigner} onValueChange={(v) => v && setSelectedDesigner(v)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 디자이너</SelectItem>
              {DESIGNERS.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 주간 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => setCurrentDate(d => addDays(d, -7))}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(weekDays[0], 'M월 d일', { locale: ko })} — {format(weekDays[6], 'M월 d일', { locale: ko })}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => setCurrentDate(d => addDays(d, 7))}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-brand/20 border border-brand/40" /> 미미올 예약</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 border border-green-300" /> 네이버</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-300" /> 전화/워크인</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-400" /> 블록</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 border border-gray-300" /> 완료</span>
      </div>

      {/* 캘린더 그리드 */}
      {filteredDesigners.map(designer => (
        <Card key={designer.id} className="mb-6">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-semibold">{designer.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <div className="min-w-[800px]">
              {/* 헤더: 요일 */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
                <div className="p-2 text-xs text-muted-foreground text-center">시간</div>
                {weekDays.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const isToday = isSameDay(day, new Date(2026, 3, 10))
                  return (
                    <div key={dateStr} className={`p-2 text-center border-l ${isToday ? 'bg-brand/5' : ''}`}>
                      <p className={`text-xs ${isToday ? 'text-brand font-bold' : 'text-muted-foreground'}`}>
                        {format(day, 'EEE', { locale: ko })}
                      </p>
                      <p className={`text-sm font-semibold ${isToday ? 'text-brand' : ''}`}>
                        {format(day, 'd')}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* 시간별 행 */}
              {TIME_SLOTS.map(time => (
                <div key={time} className="grid grid-cols-[60px_repeat(7,1fr)] border-b last:border-0 min-h-[40px]">
                  <div className="p-1 text-[11px] text-muted-foreground text-center flex items-center justify-center font-mono">
                    {time}
                  </div>
                  {weekDays.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const slotStart = isSlotStart(designer.id, dateStr, time)
                    const slotCover = getSlotForCell(designer.id, dateStr, time)
                    const isToday = isSameDay(day, new Date(2026, 3, 10))

                    // 이 셀이 다른 슬롯의 중간이면 렌더링 스킵 (rowSpan 대신 visibility로 처리)
                    if (slotCover && !slotStart) {
                      return <div key={dateStr} className={`border-l ${isToday ? 'bg-brand/5' : ''}`} />
                    }

                    if (slotStart) {
                      const span = getSlotSpan(slotStart)
                      const bgColor = slotStart.status === 'blocked'
                        ? 'bg-amber-50 border-amber-300 hover:bg-amber-100'
                        : slotStart.status === 'completed'
                        ? 'bg-gray-50 border-gray-200'
                        : slotStart.source === 'mimiall'
                        ? 'bg-brand/10 border-brand/30 hover:bg-brand/20'
                        : slotStart.source === 'naver'
                        ? 'bg-green-50 border-green-200 hover:bg-green-100'
                        : 'bg-blue-50 border-blue-200 hover:bg-blue-100'

                      return (
                        <div key={dateStr} className={`border-l relative ${isToday ? 'bg-brand/5' : ''}`}>
                          <button
                            onClick={() => handleSlotClick(slotStart)}
                            className={`absolute inset-x-0.5 top-0.5 rounded-md border px-1.5 py-0.5 text-left cursor-pointer transition-colors ${bgColor}`}
                            style={{ height: `calc(${span * 40}px - 4px)` }}
                          >
                            <div className="flex items-center gap-1">
                              {slotStart.status === 'blocked' ? (
                                <Lock className="w-3 h-3 text-amber-600" />
                              ) : (
                                SOURCE_ICON[slotStart.source]
                              )}
                              <span className="text-[10px] font-medium truncate">
                                {slotStart.status === 'blocked'
                                  ? (slotStart.memo || '블록')
                                  : slotStart.customerName}
                              </span>
                            </div>
                            {slotStart.menuName && (
                              <p className="text-[9px] text-muted-foreground truncate mt-0.5">
                                {slotStart.menuName}
                              </p>
                            )}
                          </button>
                        </div>
                      )
                    }

                    // 빈 셀
                    return (
                      <div
                        key={dateStr}
                        className={`border-l cursor-pointer hover:bg-muted/50 transition-colors ${isToday ? 'bg-brand/5' : ''}`}
                        onClick={() => handleEmptyClick(designer.id, dateStr, time)}
                      />
                    )
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
                <DialogDescription>
                  {clickedTime.date} {clickedTime.time} — {DESIGNERS.find(d => d.id === clickedTime.designerId)?.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div>
                  <Label>유형</Label>
                  <Select
                    value={blockForm.source}
                    onValueChange={(v) => v && setBlockForm(f => ({ ...f, source: v as ReservationSource }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="other">블록 (예약 불가 처리)</SelectItem>
                      <SelectItem value="naver">네이버 예약 (수기)</SelectItem>
                      <SelectItem value="phone">전화 예약 (수기)</SelectItem>
                      <SelectItem value="walkin">워크인 (수기)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>종료 시간</Label>
                  <Select
                    value={blockForm.endTime}
                    onValueChange={(v) => v && setBlockForm(f => ({ ...f, endTime: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.filter(t => t > clickedTime.time).map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {blockForm.source !== 'other' && (
                  <>
                    <div>
                      <Label>고객명</Label>
                      <Input
                        placeholder="고객 이름"
                        value={blockForm.customerName}
                        onChange={(e) => setBlockForm(f => ({ ...f, customerName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>연락처</Label>
                      <Input
                        placeholder="010-0000-0000"
                        value={blockForm.customerPhone}
                        onChange={(e) => setBlockForm(f => ({ ...f, customerPhone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>시술 메뉴</Label>
                      <Input
                        placeholder="커트, 염색 등"
                        value={blockForm.menuName}
                        onChange={(e) => setBlockForm(f => ({ ...f, menuName: e.target.value }))}
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label>메모</Label>
                  <Textarea
                    placeholder={blockForm.source === 'other' ? '블록 사유 (선택)' : '기타 메모 (선택)'}
                    value={blockForm.memo}
                    onChange={(e) => setBlockForm(f => ({ ...f, memo: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>취소</Button>
                  <Button className="flex-1 bg-brand hover:bg-brand-dark text-white" onClick={handleSaveBlock}>
                    {blockForm.source === 'other' && !blockForm.customerName ? (
                      <><Lock className="w-4 h-4 mr-1" /> 블록 처리</>
                    ) : (
                      <><Plus className="w-4 h-4 mr-1" /> 수기 예약</>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}

          {dialogMode === 'detail' && selectedSlot && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedSlot.status === 'blocked' ? '블록 상세' : '예약 상세'}
                </DialogTitle>
                <DialogDescription>
                  {selectedSlot.date} {selectedSlot.startTime} ~ {selectedSlot.endTime}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">상태</span>
                  <Badge variant={selectedSlot.status === 'blocked' ? 'secondary' : 'default'}>
                    {selectedSlot.status === 'blocked' ? '블록' : selectedSlot.status === 'completed' ? '완료' : '확정'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">유입 경로</span>
                  <span className="flex items-center gap-1 text-sm">
                    {SOURCE_ICON[selectedSlot.source]}
                    {SOURCE_LABEL[selectedSlot.source]}
                  </span>
                </div>
                {selectedSlot.customerName && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">고객명</span>
                    <span className="text-sm font-medium">{selectedSlot.customerName}</span>
                  </div>
                )}
                {selectedSlot.menuName && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">시술</span>
                    <span className="text-sm">{selectedSlot.menuName}</span>
                  </div>
                )}
                {selectedSlot.memo && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">메모</span>
                    <span className="text-sm">{selectedSlot.memo}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t">
                  {selectedSlot.status === 'blocked' && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleCancelSlot(selectedSlot.id)}
                    >
                      <Unlock className="w-4 h-4 mr-1" /> 블록 해제
                    </Button>
                  )}
                  {selectedSlot.status === 'confirmed' && (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1 text-destructive"
                        onClick={() => handleCancelSlot(selectedSlot.id)}
                      >
                        <X className="w-4 h-4 mr-1" /> 예약 취소
                      </Button>
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleComplete(selectedSlot.id)}
                      >
                        완료 처리
                      </Button>
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
