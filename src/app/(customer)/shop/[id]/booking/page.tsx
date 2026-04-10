'use client'

import { use, useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  ChevronLeft, ChevronRight, Check,
  Clock, Banknote, Calendar, CreditCard,
} from 'lucide-react'
import { format, addDays, isSameDay, isAfter, startOfToday } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toast } from 'sonner'

const DESIGNERS = [
  { id: 'd1', name: '김수진', title: '원장' },
  { id: 'd2', name: '박서윤', title: '실장' },
  { id: 'd3', name: '이도현', title: '디자이너' },
]

const MENUS = [
  { id: 'm1', name: '여성 커트', price: 30000, discountPrice: null, duration: 40 },
  { id: 'm2', name: '남성 커트', price: 20000, discountPrice: null, duration: 30 },
  { id: 'm3', name: '커트 + 셋팅', price: 45000, discountPrice: 40000, duration: 50 },
  { id: 'm4', name: '전체 염색', price: 80000, discountPrice: null, duration: 90 },
  { id: 'm6', name: '디지털 펌', price: 120000, discountPrice: 100000, duration: 120 },
]

// 데모: 이미 예약된 시간
const BOOKED_SLOTS: Record<string, string[]> = {
  '2026-04-10_d1': ['10:00', '10:30', '13:00', '13:30', '14:00', '14:30', '15:00'],
  '2026-04-10_d2': ['11:00', '11:30', '12:00'],
  '2026-04-11_d1': ['10:00', '10:30'],
}

const ALL_TIMES = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30',
  '18:00','18:30','19:00','19:30',
]

type Step = 'menu' | 'designer' | 'datetime' | 'confirm'

export default function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [step, setStep] = useState<Step>('menu')
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null)
  const [selectedDesigner, setSelectedDesigner] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [dateOffset, setDateOffset] = useState(0)

  const menu = MENUS.find(m => m.id === selectedMenu)
  const designer = DESIGNERS.find(d => d.id === selectedDesigner)
  const today = new Date(2026, 3, 10)

  const dates = Array.from({ length: 7 }, (_, i) => addDays(today, i + dateOffset))

  const availableTimes = useMemo(() => {
    if (!selectedDate || !selectedDesigner) return []
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const key = `${dateStr}_${selectedDesigner}`
    const booked = BOOKED_SLOTS[key] || []
    return ALL_TIMES.map(t => ({ time: t, available: !booked.includes(t) }))
  }, [selectedDate, selectedDesigner])

  const price = menu ? (menu.discountPrice ?? menu.price) : 0
  const fee = Math.round(price * 0.003) // 0.3% Point3 수수료

  const handleConfirm = () => {
    toast.success('예약이 완료되었습니다! 예약 내역에서 확인하세요.')
  }

  const steps: { key: Step; label: string }[] = [
    { key: 'menu', label: '시술 선택' },
    { key: 'designer', label: '디자이너' },
    { key: 'datetime', label: '날짜/시간' },
    { key: 'confirm', label: '예약 확인' },
  ]

  const stepIdx = steps.findIndex(s => s.key === step)

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-32">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/shop/${id}`}>
          <Button variant="ghost" size="icon"><ChevronLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-lg font-bold">예약하기</h1>
          <p className="text-xs text-muted-foreground">루미에르 헤어</p>
        </div>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-1 mb-8">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
              i <= stepIdx ? 'bg-brand text-white' : 'bg-muted text-muted-foreground'
            }`}>
              {i < stepIdx ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`ml-1.5 text-xs font-medium hidden sm:block ${
              i <= stepIdx ? 'text-brand' : 'text-muted-foreground'
            }`}>{s.label}</span>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 rounded ${i < stepIdx ? 'bg-brand' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: 메뉴 선택 */}
      {step === 'menu' && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold mb-4">시술을 선택해주세요</h2>
          {MENUS.map(m => (
            <button
              key={m.id}
              onClick={() => { setSelectedMenu(m.id); setStep('designer') }}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                selectedMenu === m.id
                  ? 'border-brand bg-brand/5 ring-2 ring-brand/20'
                  : 'hover:bg-muted/50'
              }`}
            >
              <div>
                <h3 className="font-medium">{m.name}</h3>
                <span className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Clock className="w-3 h-3" /> {m.duration}분
                </span>
              </div>
              <div className="text-right">
                {m.discountPrice ? (
                  <div>
                    <span className="text-xs text-muted-foreground line-through">{m.price.toLocaleString()}</span>
                    <p className="text-brand font-bold">{m.discountPrice.toLocaleString()}원</p>
                  </div>
                ) : (
                  <p className="font-bold">{m.price.toLocaleString()}원</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: 디자이너 선택 */}
      {step === 'designer' && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold mb-4">디자이너를 선택해주세요</h2>
          {DESIGNERS.map(d => (
            <button
              key={d.id}
              onClick={() => { setSelectedDesigner(d.id); setStep('datetime') }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                selectedDesigner === d.id
                  ? 'border-brand bg-brand/5 ring-2 ring-brand/20'
                  : 'hover:bg-muted/50'
              }`}
            >
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-brand-light text-brand font-bold">
                  {d.name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{d.name}</h3>
                  <Badge variant="secondary" className="text-[10px]">{d.title}</Badge>
                </div>
              </div>
            </button>
          ))}
          <Button variant="ghost" className="w-full mt-2" onClick={() => setStep('menu')}>
            <ChevronLeft className="w-4 h-4 mr-1" /> 이전
          </Button>
        </div>
      )}

      {/* Step 3: 날짜/시간 선택 */}
      {step === 'datetime' && (
        <div>
          <h2 className="text-lg font-bold mb-4">날짜와 시간을 선택해주세요</h2>

          {/* 날짜 선택 */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setDateOffset(o => Math.max(0, o - 7))}
              className="p-2 rounded-lg hover:bg-muted"
              disabled={dateOffset === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex-1 flex gap-1.5 overflow-x-auto">
              {dates.map(date => {
                const isSelected = selectedDate && isSameDay(date, selectedDate)
                const isToday = isSameDay(date, today)
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => { setSelectedDate(date); setSelectedTime(null) }}
                    className={`flex-1 min-w-[52px] py-3 rounded-xl text-center transition-all ${
                      isSelected
                        ? 'bg-brand text-white shadow-md'
                        : isToday
                        ? 'bg-brand/10 text-brand'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <p className="text-[10px] font-medium">{format(date, 'EEE', { locale: ko })}</p>
                    <p className="text-lg font-bold">{format(date, 'd')}</p>
                  </button>
                )
              })}
            </div>
            <button onClick={() => setDateOffset(o => o + 7)} className="p-2 rounded-lg hover:bg-muted">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 시간 선택 */}
          {selectedDate && (
            <div>
              <h3 className="font-medium text-sm mb-3">
                {format(selectedDate, 'M월 d일 (EEE)', { locale: ko })} 예약 가능 시간
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {availableTimes.map(({ time, available }) => (
                  <button
                    key={time}
                    disabled={!available}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                      selectedTime === time
                        ? 'bg-brand text-white shadow-md'
                        : available
                        ? 'bg-muted hover:bg-brand/10 hover:text-brand'
                        : 'bg-muted/30 text-muted-foreground/30 cursor-not-allowed line-through'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-6">
            <Button variant="ghost" className="flex-1" onClick={() => setStep('designer')}>
              <ChevronLeft className="w-4 h-4 mr-1" /> 이전
            </Button>
            <Button
              className="flex-1 bg-brand hover:bg-brand-dark text-white"
              disabled={!selectedTime}
              onClick={() => setStep('confirm')}
            >
              다음
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: 확인 */}
      {step === 'confirm' && menu && designer && selectedDate && selectedTime && (
        <div>
          <h2 className="text-lg font-bold mb-4">예약 정보 확인</h2>

          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">매장</span>
                <span className="text-sm font-medium">루미에르 헤어</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">시술</span>
                <span className="text-sm font-medium">{menu.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">디자이너</span>
                <span className="text-sm font-medium">{designer.name} {designer.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">날짜</span>
                <span className="text-sm font-medium">
                  {format(selectedDate, 'yyyy년 M월 d일 (EEE)', { locale: ko })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">시간</span>
                <span className="text-sm font-medium">{selectedTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">소요시간</span>
                <span className="text-sm font-medium">{menu.duration}분</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">결제 금액</span>
                <span className="text-xl font-bold text-brand">{price.toLocaleString()}원</span>
              </div>
            </CardContent>
          </Card>

          {/* 결제 수단 */}
          <div className="mt-6">
            <h3 className="font-medium text-sm mb-3">결제 수단</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-brand bg-brand/5">
                <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center">
                  <span className="text-white font-bold text-xs">P3</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Point3 간편결제</p>
                  <p className="text-xs text-brand">수수료 0.3% · 업계 최저</p>
                </div>
                <Check className="w-5 h-5 text-brand" />
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl border hover:bg-muted/30 cursor-pointer transition-colors">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">신용카드</p>
                  <p className="text-xs text-muted-foreground">포트원 결제</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button variant="ghost" className="flex-1" onClick={() => setStep('datetime')}>
              <ChevronLeft className="w-4 h-4 mr-1" /> 이전
            </Button>
            <Button
              className="flex-1 h-12 bg-brand hover:bg-brand-dark text-white text-base font-semibold"
              onClick={handleConfirm}
            >
              {price.toLocaleString()}원 결제하기
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
