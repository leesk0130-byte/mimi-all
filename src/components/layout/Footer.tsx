import Link from 'next/link'

export function Footer() {
  return (
    <footer className="hidden md:block bg-muted/50 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-brand flex items-center justify-center">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <span className="text-lg font-bold">미미올</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              내 주변 뷰티샵을 한눈에.<br />
              예약부터 결제까지 간편하게.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">서비스</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/search?category=hair" className="hover:text-foreground transition-colors">헤어샵</Link></li>
              <li><Link href="/search?category=nail" className="hover:text-foreground transition-colors">네일샵</Link></li>
              <li><Link href="/search?category=skin" className="hover:text-foreground transition-colors">피부관리</Link></li>
              <li><Link href="/search?category=lash" className="hover:text-foreground transition-colors">속눈썹</Link></li>
              <li><Link href="/search?category=barber" className="hover:text-foreground transition-colors">바버샵</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">입점 안내</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/signup?role=owner" className="hover:text-foreground transition-colors">입점 신청</Link></li>
              <li><span>수수료 0.3%</span></li>
              <li><span>Point3 간편결제</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">고객 지원</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span>이용약관</span></li>
              <li><span>개인정보처리방침</span></li>
              <li><span>고객센터</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} 미미올(Mimi-all). All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
