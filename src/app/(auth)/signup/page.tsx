'use client'

import Link from 'next/link'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, User, Phone } from 'lucide-react'

export default function SignupPage() {
  return <Suspense><SignupContent /></Suspense>
}

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOwner = searchParams.get('role') === 'owner'

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    passwordConfirm: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.passwordConfirm) {
      toast.error('비밀번호가 일치하지 않습니다.')
      return
    }
    if (!agreed) {
      toast.error('이용약관에 동의해주세요.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          phone: form.phone,
          role: isOwner ? 'owner' : 'customer',
        },
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    toast.success('회원가입이 완료되었습니다! 이메일 인증을 확인해주세요.')
    router.push('/login')
  }

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        queryParams: isOwner ? { role: 'owner' } : undefined,
      },
    })
  }

  return (
    <div className="w-full max-w-sm">
      <Link href="/" className="flex items-center justify-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
          <span className="text-white font-bold text-lg">M</span>
        </div>
        <span className="text-2xl font-bold">미미올</span>
      </Link>

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h1 className="text-xl font-bold text-center mb-1">
          {isOwner ? '입점 회원가입' : '회원가입'}
        </h1>
        {isOwner && (
          <p className="text-sm text-brand text-center mb-4">
            사장님 전용 · 수수료 0.3%
          </p>
        )}

        <form onSubmit={handleSignup} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="홍길동"
                className="pl-10"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="hello@example.com"
                className="pl-10"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">전화번호</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                className="pl-10"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? 'text' : 'password'}
                placeholder="6자 이상"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
            <Input
              id="passwordConfirm"
              type="password"
              placeholder="비밀번호 다시 입력"
              value={form.passwordConfirm}
              onChange={(e) => update('passwordConfirm', e.target.value)}
              required
              minLength={6}
            />
          </div>

          {/* 약관 동의 */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 accent-brand"
            />
            <span className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-foreground font-medium">이용약관</span> 및{' '}
              <span className="text-foreground font-medium">개인정보처리방침</span>에 동의합니다.
            </span>
          </label>

          <Button
            type="submit"
            className="w-full bg-brand hover:bg-brand-dark text-white"
            disabled={loading}
          >
            {loading ? '가입 중...' : isOwner ? '입점 신청하기' : '가입하기'}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">또는</span>
          <Separator className="flex-1" />
        </div>

        <div className="space-y-2">
          <button
            onClick={() => handleSocialLogin('google')}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 가입
          </button>
          <button
            onClick={() => handleSocialLogin('kakao')}
            className="w-full flex items-center justify-center gap-2 h-10 rounded-lg bg-[#FEE500] hover:bg-[#FDD835] transition-colors text-sm font-medium text-[#191919]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#191919">
              <path d="M12 3C6.48 3 2 6.36 2 10.5c0 2.67 1.76 5.02 4.41 6.34l-1.12 4.16 4.83-3.18c.6.08 1.23.13 1.88.13 5.52 0 10-3.36 10-7.5S17.52 3 12 3z"/>
            </svg>
            카카오로 가입
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        이미 회원이신가요?{' '}
        <Link href="/login" className="text-brand font-medium hover:underline">
          로그인
        </Link>
      </p>
      {!isOwner && (
        <p className="text-center text-xs text-muted-foreground mt-2">
          사장님이신가요?{' '}
          <Link href="/signup?role=owner" className="text-brand font-medium hover:underline">
            입점 신청
          </Link>
        </p>
      )}
    </div>
  )
}
