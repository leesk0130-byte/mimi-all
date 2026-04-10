// Point3 간편결제 API Wrapper
// 실제 Point3 API 스펙에 맞게 조정 필요

const POINT3_API_BASE = 'https://api.point3pay.com/v1'

interface Point3PrepareRequest {
  merchantId: string
  orderId: string
  amount: number
  orderName: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  successUrl: string
  failUrl: string
}

interface Point3PrepareResponse {
  paymentId: string
  checkoutUrl: string
}

interface Point3ConfirmRequest {
  paymentId: string
  orderId: string
  amount: number
}

interface Point3ConfirmResponse {
  paymentId: string
  orderId: string
  status: 'DONE' | 'FAILED'
  method: string
  totalAmount: number
  approvedAt: string
  receipt?: {
    url: string
  }
}

export async function preparePayment(data: Point3PrepareRequest): Promise<Point3PrepareResponse> {
  const res = await fetch(`${POINT3_API_BASE}/payments/prepare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${process.env.POINT3_API_KEY}:${process.env.POINT3_SECRET_KEY}`).toString('base64')}`,
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Point3 결제 준비 실패')
  }

  return res.json()
}

export async function confirmPayment(data: Point3ConfirmRequest): Promise<Point3ConfirmResponse> {
  const res = await fetch(`${POINT3_API_BASE}/payments/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${process.env.POINT3_API_KEY}:${process.env.POINT3_SECRET_KEY}`).toString('base64')}`,
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Point3 결제 승인 실패')
  }

  return res.json()
}

export async function cancelPayment(paymentId: string, reason: string) {
  const res = await fetch(`${POINT3_API_BASE}/payments/${paymentId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${process.env.POINT3_API_KEY}:${process.env.POINT3_SECRET_KEY}`).toString('base64')}`,
    },
    body: JSON.stringify({ cancelReason: reason }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Point3 결제 취소 실패')
  }

  return res.json()
}

export function calculateFee(amount: number): { feeRate: number; feeAmount: number; settlementAmount: number } {
  const feeRate = 0.3
  const feeAmount = Math.round(amount * feeRate / 100)
  return {
    feeRate,
    feeAmount,
    settlementAmount: amount - feeAmount,
  }
}
