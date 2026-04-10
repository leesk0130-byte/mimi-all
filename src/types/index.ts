// ============================================
// 미미올 (Mimi-all) Type Definitions
// ============================================

export type UserRole = 'customer' | 'owner' | 'admin'
export type ShopStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type ReservationStatus = 'confirmed' | 'cancelled' | 'noshow' | 'completed' | 'blocked'
export type ReservationSource = 'mimiall' | 'naver' | 'phone' | 'walkin' | 'other'
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'
export type PaymentMethod = 'point3' | 'card' | 'portone'
export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export type ShopCategory =
  | 'hair'        // 헤어샵
  | 'nail'        // 네일샵
  | 'skin'        // 피부/에스테틱
  | 'lash'        // 눈썹 & 속눈썹
  | 'waxing'      // 왁싱
  | 'barber'      // 바버샵
  | 'makeup'      // 메이크업

export interface User {
  id: string
  email: string
  phone: string | null
  name: string
  nickname: string | null
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Shop {
  id: string
  owner_id: string
  name: string
  description: string | null
  category: ShopCategory
  phone: string | null
  address: string
  address_detail: string | null
  latitude: number | null
  longitude: number | null
  images: string[]
  thumbnail_url: string | null
  status: ShopStatus
  avg_rating: number
  review_count: number
  slot_duration: number
  created_at: string
  updated_at: string
  // Joined
  owner?: User
  designers?: Designer[]
  menus?: Menu[]
  hours?: ShopHours[]
}

export interface ShopHours {
  id: string
  shop_id: string
  day: DayOfWeek
  open_time: string
  close_time: string
  is_closed: boolean
  break_start: string | null
  break_end: string | null
}

export interface Designer {
  id: string
  shop_id: string
  user_id: string | null
  name: string
  title: string | null
  profile_image: string | null
  introduction: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Menu {
  id: string
  shop_id: string
  category: string | null
  name: string
  description: string | null
  price: number
  discount_price: number | null
  duration: number
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Reservation {
  id: string
  shop_id: string
  designer_id: string
  customer_id: string | null
  menu_id: string | null
  date: string
  start_time: string
  end_time: string
  status: ReservationStatus
  source: ReservationSource
  block_memo: string | null
  customer_name: string | null
  customer_phone: string | null
  total_price: number
  cancel_reason: string | null
  cancelled_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  // Joined
  shop?: Shop
  designer?: Designer
  menu?: Menu
  customer?: User
  payment?: Payment
}

export interface Payment {
  id: string
  reservation_id: string
  customer_id: string
  shop_id: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  point3_tx_id: string | null
  point3_account_info: Record<string, unknown> | null
  portone_imp_uid: string | null
  portone_merchant_uid: string | null
  fee_rate: number
  fee_amount: number
  settlement_amount: number
  paid_at: string | null
  refunded_at: string | null
  created_at: string
}

export interface Review {
  id: string
  reservation_id: string
  customer_id: string
  shop_id: string
  designer_id: string
  rating: number
  content: string | null
  images: string[]
  owner_reply: string | null
  owner_replied_at: string | null
  is_visible: boolean
  created_at: string
  updated_at: string
  // Joined
  customer?: User
  designer?: Designer
  reservation?: Reservation
}

export interface Settlement {
  id: string
  shop_id: string
  period_start: string
  period_end: string
  total_sales: number
  total_fee: number
  total_settlement: number
  payment_count: number
  is_paid: boolean
  paid_at: string | null
  created_at: string
}

export interface Favorite {
  user_id: string
  shop_id: string
  created_at: string
}

// UI Helper Types
export interface TimeSlot {
  time: string       // "09:00"
  available: boolean
  reservation?: Reservation
}

export const SHOP_CATEGORIES: { value: ShopCategory; label: string; icon: string }[] = [
  { value: 'hair', label: '헤어샵', icon: 'Scissors' },
  { value: 'nail', label: '네일샵', icon: 'Sparkles' },
  { value: 'skin', label: '피부관리', icon: 'Heart' },
  { value: 'lash', label: '눈썹/속눈썹', icon: 'Eye' },
  { value: 'waxing', label: '왁싱', icon: 'Zap' },
  { value: 'barber', label: '바버샵', icon: 'User' },
  { value: 'makeup', label: '메이크업', icon: 'Palette' },
]

export const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: '월', tue: '화', wed: '수', thu: '목',
  fri: '금', sat: '토', sun: '일',
}

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  confirmed: '예약확정',
  cancelled: '취소',
  noshow: '노쇼',
  completed: '완료',
  blocked: '블록',
}

export const RESERVATION_SOURCE_LABELS: Record<ReservationSource, string> = {
  mimiall: '미미올',
  naver: '네이버',
  phone: '전화',
  walkin: '워크인',
  other: '기타',
}
