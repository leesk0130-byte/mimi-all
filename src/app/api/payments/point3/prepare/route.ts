import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { preparePayment, calculateFee } from '@/lib/payment/point3'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { reservationId, amount, orderName, customerName, customerEmail, customerPhone } = body

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 예약 확인
    const { data: reservation } = await supabase
      .from('reservations')
      .select('*, shop:shops(*)')
      .eq('id', reservationId)
      .single()

    if (!reservation) {
      return NextResponse.json({ error: '예약 정보를 찾을 수 없습니다.' }, { status: 404 })
    }

    const orderId = `MIMI_${Date.now()}_${reservationId.slice(0, 8)}`
    const origin = request.headers.get('origin') || ''

    // Point3 결제 준비
    const result = await preparePayment({
      merchantId: process.env.NEXT_PUBLIC_POINT3_MERCHANT_ID!,
      orderId,
      amount,
      orderName,
      customerName,
      customerEmail,
      customerPhone,
      successUrl: `${origin}/api/payments/point3/confirm?orderId=${orderId}`,
      failUrl: `${origin}/my/bookings?payment=failed`,
    })

    // 수수료 계산
    const { feeRate, feeAmount, settlementAmount } = calculateFee(amount)

    // Payment 레코드 생성
    await supabase.from('payments').insert({
      reservation_id: reservationId,
      customer_id: user.id,
      shop_id: reservation.shop_id,
      amount,
      method: 'point3',
      status: 'pending',
      point3_tx_id: result.paymentId,
      fee_rate: feeRate,
      fee_amount: feeAmount,
      settlement_amount: settlementAmount,
    })

    return NextResponse.json({
      paymentId: result.paymentId,
      checkoutUrl: result.checkoutUrl,
      orderId,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '결제 준비 중 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
