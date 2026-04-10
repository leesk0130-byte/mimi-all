import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPaymentStatus } from '@/lib/payment/portone'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { paymentId } = body

    // 포트원 결제 상태 조회
    const portonePayment = await getPaymentStatus(paymentId)

    const supabase = createAdminClient()

    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('portone_imp_uid', paymentId)
      .single()

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (portonePayment.status === 'PAID' && payment.status !== 'paid') {
      await supabase
        .from('payments')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', payment.id)

      await supabase
        .from('reservations')
        .update({ status: 'confirmed' })
        .eq('id', payment.reservation_id)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
