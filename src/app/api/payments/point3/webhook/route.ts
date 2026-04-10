import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { paymentId, status, approvedAt } = body

    // TODO: Point3 웹훅 시그니처 검증
    // const signature = request.headers.get('x-point3-signature')

    const supabase = createAdminClient()

    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('point3_tx_id', paymentId)
      .single()

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (status === 'DONE' && payment.status !== 'paid') {
      await supabase
        .from('payments')
        .update({ status: 'paid', paid_at: approvedAt })
        .eq('id', payment.id)

      await supabase
        .from('reservations')
        .update({ status: 'confirmed' })
        .eq('id', payment.reservation_id)
    } else if (status === 'CANCELLED') {
      await supabase
        .from('payments')
        .update({ status: 'refunded', refunded_at: new Date().toISOString() })
        .eq('id', payment.id)

      await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', payment.reservation_id)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
