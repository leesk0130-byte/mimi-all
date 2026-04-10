-- ============================================
-- 미미올 (Mimi-all) Database Schema
-- Supabase (PostgreSQL)
-- ============================================

-- 기존 타입 삭제 (개발 환경용)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS shop_status CASCADE;
DROP TYPE IF EXISTS reservation_status CASCADE;
DROP TYPE IF EXISTS reservation_source CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS day_of_week CASCADE;

-- ENUM 타입 정의
CREATE TYPE user_role AS ENUM ('customer', 'owner', 'admin');
CREATE TYPE shop_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE reservation_status AS ENUM (
  'confirmed',
  'cancelled',
  'noshow',
  'completed',
  'blocked'
);
CREATE TYPE reservation_source AS ENUM (
  'mimiall',
  'naver',
  'phone',
  'walkin',
  'other'
);
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');
CREATE TYPE payment_method AS ENUM ('point3', 'card', 'portone');
CREATE TYPE day_of_week AS ENUM ('mon','tue','wed','thu','fri','sat','sun');

-- ============================================
-- 1. Users
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  name VARCHAR(100) NOT NULL,
  nickname VARCHAR(50),
  avatar_url TEXT,
  role user_role DEFAULT 'customer',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auth 트리거: 회원가입 시 users 테이블에 자동 삽입
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 2. Shops
-- ============================================
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  address TEXT NOT NULL,
  address_detail TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  images TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  status shop_status DEFAULT 'pending',
  avg_rating NUMERIC(2,1) DEFAULT 0,
  review_count INT DEFAULT 0,
  slot_duration INT DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_shops_category ON shops(category);
CREATE INDEX idx_shops_status ON shops(status);
CREATE INDEX idx_shops_owner ON shops(owner_id);

-- ============================================
-- 3. Shop Business Hours
-- ============================================
CREATE TABLE shop_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  day day_of_week NOT NULL,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT false,
  break_start TIME,
  break_end TIME,
  UNIQUE(shop_id, day)
);

-- ============================================
-- 4. Designers
-- ============================================
CREATE TABLE designers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  title VARCHAR(50),
  profile_image TEXT,
  introduction TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_designers_shop ON designers(shop_id);

-- ============================================
-- 5. Menus
-- ============================================
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  category VARCHAR(100),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price INT NOT NULL,
  discount_price INT,
  duration INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_menus_shop ON menus(shop_id);

-- ============================================
-- 6. Designer-Menu 매핑
-- ============================================
CREATE TABLE designer_menus (
  designer_id UUID REFERENCES designers(id) ON DELETE CASCADE,
  menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  PRIMARY KEY (designer_id, menu_id)
);

-- ============================================
-- 7. Reservations (핵심)
-- ============================================
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id),
  designer_id UUID NOT NULL REFERENCES designers(id),
  customer_id UUID REFERENCES users(id),
  menu_id UUID REFERENCES menus(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status reservation_status DEFAULT 'confirmed',
  source reservation_source DEFAULT 'mimiall',
  block_memo TEXT,
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  total_price INT DEFAULT 0,
  cancel_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reservations_shop_date ON reservations(shop_id, date);
CREATE INDEX idx_reservations_designer_date ON reservations(designer_id, date);
CREATE INDEX idx_reservations_customer ON reservations(customer_id);
CREATE INDEX idx_reservations_status ON reservations(status);

-- ============================================
-- 8. Payments
-- ============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id),
  customer_id UUID NOT NULL REFERENCES users(id),
  shop_id UUID NOT NULL REFERENCES shops(id),
  amount INT NOT NULL,
  method payment_method NOT NULL,
  status payment_status DEFAULT 'pending',
  point3_tx_id VARCHAR(100),
  point3_account_info JSONB,
  portone_imp_uid VARCHAR(100),
  portone_merchant_uid VARCHAR(100),
  fee_rate NUMERIC(4,2) DEFAULT 0.30,
  fee_amount INT DEFAULT 0,
  settlement_amount INT DEFAULT 0,
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payments_shop ON payments(shop_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_reservation ON payments(reservation_id);

-- ============================================
-- 9. Reviews
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID UNIQUE NOT NULL REFERENCES reservations(id),
  customer_id UUID NOT NULL REFERENCES users(id),
  shop_id UUID NOT NULL REFERENCES shops(id),
  designer_id UUID NOT NULL REFERENCES designers(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  images TEXT[] DEFAULT '{}',
  owner_reply TEXT,
  owner_replied_at TIMESTAMPTZ,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reviews_shop ON reviews(shop_id);
CREATE INDEX idx_reviews_customer ON reviews(customer_id);

-- ============================================
-- 10. Settlements
-- ============================================
CREATE TABLE settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_sales INT DEFAULT 0,
  total_fee INT DEFAULT 0,
  total_settlement INT DEFAULT 0,
  payment_count INT DEFAULT 0,
  is_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_settlements_shop ON settlements(shop_id);

-- ============================================
-- 11. Favorites
-- ============================================
CREATE TABLE favorites (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, shop_id)
);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "users_select_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);

-- Shops: 승인된 샵은 누구나 조회
CREATE POLICY "shops_select_approved" ON shops FOR SELECT USING (status = 'approved');
CREATE POLICY "shops_select_own" ON shops FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "shops_insert_owner" ON shops FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "shops_update_own" ON shops FOR UPDATE USING (auth.uid() = owner_id);

-- Shop Hours
CREATE POLICY "shop_hours_select" ON shop_hours FOR SELECT USING (true);
CREATE POLICY "shop_hours_manage" ON shop_hours FOR ALL USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);

-- Designers
CREATE POLICY "designers_select" ON designers FOR SELECT USING (true);
CREATE POLICY "designers_manage" ON designers FOR ALL USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);

-- Menus
CREATE POLICY "menus_select" ON menus FOR SELECT USING (true);
CREATE POLICY "menus_manage" ON menus FOR ALL USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);

-- Reservations
CREATE POLICY "reservations_select_customer" ON reservations FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "reservations_select_owner" ON reservations FOR SELECT USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);
CREATE POLICY "reservations_insert_customer" ON reservations FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "reservations_manage_owner" ON reservations FOR ALL USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);

-- Payments
CREATE POLICY "payments_select_customer" ON payments FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "payments_select_owner" ON payments FOR SELECT USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);

-- Reviews
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (is_visible = true);
CREATE POLICY "reviews_insert_customer" ON reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "reviews_update_customer" ON reviews FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "reviews_reply_owner" ON reviews FOR UPDATE USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);

-- Settlements
CREATE POLICY "settlements_select_owner" ON settlements FOR SELECT USING (
  shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
);

-- Favorites
CREATE POLICY "favorites_select_own" ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "favorites_manage_own" ON favorites FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- updated_at 자동 업데이트 트리거
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_shops_updated_at BEFORE UPDATE ON shops FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 리뷰 작성/삭제 시 샵 평점 자동 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION update_shop_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_shop_id UUID;
BEGIN
  target_shop_id := COALESCE(NEW.shop_id, OLD.shop_id);
  UPDATE shops SET
    avg_rating = COALESCE((SELECT AVG(rating)::NUMERIC(2,1) FROM reviews WHERE shop_id = target_shop_id AND is_visible = true), 0),
    review_count = (SELECT COUNT(*) FROM reviews WHERE shop_id = target_shop_id AND is_visible = true)
  WHERE id = target_shop_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_review_shop_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_shop_rating();
