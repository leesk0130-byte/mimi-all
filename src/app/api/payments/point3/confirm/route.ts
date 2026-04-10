import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { confirmPayment } from '@/lib/payment/point3'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const orderId = searchParams.get('orderId')
  const paymentId = searchParams.get('paymentId')

  if (!orderId || !paymentId) {
    return NextResponse.redirect(`${origin}/my/bookings?payment=failed`)
  }

  try {
    const supabase = createAdminClient()

    // Payment 레코드 조회
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('point3_tx_id', paymentId)
      .single()

    if (!payment) {
      return NextResponse.redirect(`${origin}/my/bookings?payment=failed`)
    }

    // Point3 결제 승인
    const result = await confirmPayment({
      paymentId,
      orderId,
      amount: payment.amount,
    })

    if (result.status === 'DONE') {
      // 결제 성공: Payment 상태 업데이트
      await supabase
        .from('payments')
        .update({
          status: 'paid',
          paid_at: result.approvedAt,
        })
        .eq('id', payment.id)

      // 예약 상태 확인
      await supabase
        .from('reservations')
        .update({ status: 'confirmed' })
        .eq('id', payment.reservation_id)

      return NextResponse.redirect(`${origin}/my/bookings?payment=success`)
    } else {
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment.id)

      return NextResponse.redirect(`${origin}/my/bookings?payment=failed`)
    }
  } catch {
    return NextResponse.redirect(`${origin}/my/bookings?payment=failed`)
  }
}
