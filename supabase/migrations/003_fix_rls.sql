-- RLS 정책 전면 재설정
-- 기존 정책 모두 삭제 후 재생성

-- Users
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_select" ON users FOR SELECT USING (true);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (true);

-- Shops
DROP POLICY IF EXISTS "shops_select_approved" ON shops;
DROP POLICY IF EXISTS "shops_select_own" ON shops;
DROP POLICY IF EXISTS "shops_insert_owner" ON shops;
DROP POLICY IF EXISTS "shops_update_own" ON shops;
CREATE POLICY "shops_select_all" ON shops FOR SELECT USING (true);
CREATE POLICY "shops_insert" ON shops FOR INSERT WITH CHECK (true);
CREATE POLICY "shops_update" ON shops FOR UPDATE USING (true);
CREATE POLICY "shops_delete" ON shops FOR DELETE USING (auth.uid() = owner_id);

-- Shop Hours
DROP POLICY IF EXISTS "shop_hours_select" ON shop_hours;
DROP POLICY IF EXISTS "shop_hours_manage" ON shop_hours;
CREATE POLICY "shop_hours_select" ON shop_hours FOR SELECT USING (true);
CREATE POLICY "shop_hours_insert" ON shop_hours FOR INSERT WITH CHECK (true);
CREATE POLICY "shop_hours_update" ON shop_hours FOR UPDATE USING (true);
CREATE POLICY "shop_hours_delete" ON shop_hours FOR DELETE USING (true);

-- Designers
DROP POLICY IF EXISTS "designers_select" ON designers;
DROP POLICY IF EXISTS "designers_manage" ON designers;
CREATE POLICY "designers_select" ON designers FOR SELECT USING (true);
CREATE POLICY "designers_insert" ON designers FOR INSERT WITH CHECK (true);
CREATE POLICY "designers_update" ON designers FOR UPDATE USING (true);
CREATE POLICY "designers_delete" ON designers FOR DELETE USING (true);

-- Menus
DROP POLICY IF EXISTS "menus_select" ON menus;
DROP POLICY IF EXISTS "menus_manage" ON menus;
CREATE POLICY "menus_select" ON menus FOR SELECT USING (true);
CREATE POLICY "menus_insert" ON menus FOR INSERT WITH CHECK (true);
CREATE POLICY "menus_update" ON menus FOR UPDATE USING (true);
CREATE POLICY "menus_delete" ON menus FOR DELETE USING (true);

-- Reservations
DROP POLICY IF EXISTS "reservations_select_customer" ON reservations;
DROP POLICY IF EXISTS "reservations_select_owner" ON reservations;
DROP POLICY IF EXISTS "reservations_insert_customer" ON reservations;
DROP POLICY IF EXISTS "reservations_manage_owner" ON reservations;
CREATE POLICY "reservations_select" ON reservations FOR SELECT USING (true);
CREATE POLICY "reservations_insert" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "reservations_update" ON reservations FOR UPDATE USING (true);
CREATE POLICY "reservations_delete" ON reservations FOR DELETE USING (true);

-- Payments
DROP POLICY IF EXISTS "payments_select_customer" ON payments;
DROP POLICY IF EXISTS "payments_select_owner" ON payments;
CREATE POLICY "payments_select" ON payments FOR SELECT USING (true);
CREATE POLICY "payments_insert" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "payments_update" ON payments FOR UPDATE USING (true);

-- Reviews
DROP POLICY IF EXISTS "reviews_select" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_customer" ON reviews;
DROP POLICY IF EXISTS "reviews_update_customer" ON reviews;
DROP POLICY IF EXISTS "reviews_reply_owner" ON reviews;
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews_update" ON reviews FOR UPDATE USING (true);

-- Settlements
DROP POLICY IF EXISTS "settlements_select_owner" ON settlements;
CREATE POLICY "settlements_select" ON settlements FOR SELECT USING (true);

-- Favorites
DROP POLICY IF EXISTS "favorites_select_own" ON favorites;
DROP POLICY IF EXISTS "favorites_manage_own" ON favorites;
CREATE POLICY "favorites_select" ON favorites FOR SELECT USING (true);
CREATE POLICY "favorites_insert" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "favorites_delete" ON favorites FOR DELETE USING (auth.uid() = user_id);
