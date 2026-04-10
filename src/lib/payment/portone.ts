// 포트원 (보조 결제) API Wrapper

const PORTONE_API_BASE = 'https://api.portone.io/v2'

interface PortonePrepareRequest {
  storeId: string
  paymentId: string
  orderName: string
  totalAmount: number
  currency: string
  channelKey?: string
  customer?: {
    name?: string
    email?: string
    phone?: string
  }
}

export async function getPaymentStatus(paymentId: string) {
  const res = await fetch(`${PORTONE_API_BASE}/payments/${paymentId}`, {
    headers: {
      Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
    },
  })

  if (!res.ok) {
    throw new Error('포트원 결제 조회 실패')
  }

  return res.json()
}

export async function cancelPortonePayment(paymentId: string, reason: string) {
  const res = await fetch(`${PORTONE_API_BASE}/payments/${paymentId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
    },
    body: JSON.stringify({ reason }),
  })

  if (!res.ok) {
    throw new Error('포트원 결제 취소 실패')
  }

  return res.json()
}
