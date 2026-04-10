-- 기존 트리거 재생성 (role 캐스팅 안전 처리)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_val user_role;
  user_name_val TEXT;
  user_phone_val TEXT;
BEGIN
  -- role 안전 처리
  BEGIN
    user_role_val := (NEW.raw_user_meta_data->>'role')::user_role;
  EXCEPTION WHEN OTHERS THEN
    user_role_val := 'customer';
  END;

  user_name_val := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  user_phone_val := NEW.raw_user_meta_data->>'phone';

  INSERT INTO public.users (id, email, name, phone, nickname, role)
  VALUES (
    NEW.id,
    NEW.email,
    user_name_val,
    user_phone_val,
    user_name_val,
    user_role_val
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
