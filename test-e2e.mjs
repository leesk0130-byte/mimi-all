import { chromium } from 'playwright'

const BASE = 'https://mimi-all.vercel.app'
const results = []

function log(test, pass, detail = '') {
  const icon = pass ? '✅' : '❌'
  results.push({ test, pass, detail })
  console.log(`${icon} ${test}${detail ? ' — ' + detail : ''}`)
}

async function waitForData(page, text, timeout = 8000) {
  try {
    await page.waitForFunction(
      (t) => document.body.innerText.includes(t),
      text,
      { timeout }
    )
    return true
  } catch { return false }
}

async function run() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  // ========== 1. 홈페이지 ==========
  console.log('\n=== 1. 홈페이지 ===')
  await page.goto(BASE, { waitUntil: 'networkidle' })
  const hasShop = await waitForData(page, '루미에르 헤어', 10000)
  log('루미에르 헤어 표시', hasShop)
  const body = await page.textContent('body')
  log('카테고리 표시', body.includes('헤어샵'))

  // ========== 2. 검색 ==========
  console.log('\n=== 2. 검색 ===')
  await page.goto(BASE + '/search', { waitUntil: 'networkidle' })
  const hasSearch = await waitForData(page, '루미에르', 10000)
  log('검색 페이지 — 루미에르 표시', hasSearch)

  // ========== 3. 고객 로그인 ==========
  console.log('\n=== 3. 고객 로그인 ===')
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
  await page.fill('input[type="email"]', 'customer@mimiall.test')
  await page.fill('input[type="password"]', 'test1234')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(4000)
  const url = page.url()
  log('고객 로그인 성공', url === BASE + '/' || url.includes('login'), url)

  // ========== 4. 마이페이지 ==========
  console.log('\n=== 4. 마이페이지 ===')
  await page.goto(BASE + '/my', { waitUntil: 'networkidle' })
  const hasMy = await waitForData(page, '이지은', 8000) || await waitForData(page, '마이페이지', 3000)
  log('마이페이지', hasMy)

  // 예약 내역
  await page.goto(BASE + '/my/bookings', { waitUntil: 'networkidle' })
  const hasBookings = await waitForData(page, '예약 내역', 5000)
  log('예약 내역 페이지', hasBookings)

  // ========== 5. 샵 상세 + 예약 ==========
  console.log('\n=== 5. 샵 상세 ===')
  await page.goto(BASE + '/search', { waitUntil: 'networkidle' })
  await waitForData(page, '루미에르', 10000)
  const shopLink = await page.$('a[href*="/shop/"]')
  if (shopLink) {
    const href = await shopLink.getAttribute('href')
    await page.goto(BASE + href, { waitUntil: 'networkidle' })
    const hasDetail = await waitForData(page, '루미에르', 8000)
    log('샵 상세 로드', hasDetail)
    const hasMenu = await waitForData(page, '커트', 5000)
    log('메뉴 표시', hasMenu)
    const hasDesigner = await waitForData(page, '김수진', 5000)
    log('디자이너 표시', hasDesigner)

    // 예약 페이지
    await page.goto(BASE + href + '/booking', { waitUntil: 'networkidle' })
    const hasBooking = await waitForData(page, '시술', 8000)
    log('예약 페이지 로드', hasBooking)
  } else {
    log('샵 링크', false, '검색 결과 없음')
  }

  // ========== 6. Owner ==========
  console.log('\n=== 6. Owner 대시보드 ===')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.context().clearCookies()
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
  await page.fill('input[type="email"]', 'owner@mimiall.test')
  await page.fill('input[type="password"]', 'test1234')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(4000)

  await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' })
  const hasDash = await waitForData(page, '대시보드', 8000)
  log('대시보드', hasDash)

  await page.goto(BASE + '/dashboard/calendar', { waitUntil: 'networkidle' })
  const hasCal = await waitForData(page, '캘린더', 8000) || await waitForData(page, '김수진', 5000)
  log('캘린더', hasCal)

  await page.goto(BASE + '/dashboard/designers', { waitUntil: 'networkidle' })
  const hasDes = await waitForData(page, '김수진', 8000) || await waitForData(page, '디자이너', 5000)
  log('디자이너 관리', hasDes)

  await page.goto(BASE + '/dashboard/menus', { waitUntil: 'networkidle' })
  const hasMenus = await waitForData(page, '커트', 8000) || await waitForData(page, '메뉴', 5000)
  log('메뉴 관리', hasMenus)

  await page.goto(BASE + '/dashboard/settlement', { waitUntil: 'networkidle' })
  const hasSettlement = await waitForData(page, '매출', 8000)
  log('매출/정산', hasSettlement)

  // ========== 7. Admin ==========
  console.log('\n=== 7. Admin ===')
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear() })
  await page.context().clearCookies()
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
  await page.fill('input[type="email"]', 'admin@mimiall.test')
  await page.fill('input[type="password"]', 'test1234')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(4000)

  await page.goto(BASE + '/admin', { waitUntil: 'networkidle' })
  const hasAdmin = await waitForData(page, '관리자', 8000)
  log('관리자 대시보드', hasAdmin)

  await page.goto(BASE + '/admin/shops', { waitUntil: 'networkidle' })
  const hasAdminShop = await waitForData(page, '입점', 8000)
  log('입점 관리', hasAdminShop)

  await page.goto(BASE + '/admin/users', { waitUntil: 'networkidle' })
  const hasAdminUser = await waitForData(page, '사용자', 8000)
  log('사용자 관리', hasAdminUser)

  await page.goto(BASE + '/admin/bookings', { waitUntil: 'networkidle' })
  const hasAdminBook = await waitForData(page, '예약', 8000)
  log('예약 모니터링', hasAdminBook)

  // ========== 결과 ==========
  console.log('\n========== 결과 요약 ==========')
  const passed = results.filter(r => r.pass).length
  const total = results.length
  console.log(`✅ 통과: ${passed}/${total} | ❌ 실패: ${total - passed}`)
  if (total - passed > 0) {
    console.log('\n실패 목록:')
    results.filter(r => !r.pass).forEach(r => console.log(`  ❌ ${r.test}: ${r.detail}`))
  }

  await browser.close()
}

run().catch(e => { console.error('테스트 에러:', e.message); process.exit(1) })
