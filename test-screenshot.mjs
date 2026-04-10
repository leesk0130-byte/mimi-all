import { chromium } from 'playwright'

const BASE = 'https://mimi-all.vercel.app'

async function run() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

  // 콘솔 에러 캡처
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text())
  })
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message))

  // 1. 홈
  console.log('--- 홈페이지 ---')
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(5000)
  await page.screenshot({ path: 'C:/Users/leesk0130/Desktop/Claude/ss-home.png' })
  const homeText = await page.textContent('body')
  console.log('홈 텍스트 일부:', homeText.slice(0, 500))

  // 2. 검색
  console.log('\n--- 검색 ---')
  await page.goto(BASE + '/search', { waitUntil: 'networkidle' })
  await page.waitForTimeout(5000)
  await page.screenshot({ path: 'C:/Users/leesk0130/Desktop/Claude/ss-search.png' })
  const searchText = await page.textContent('body')
  console.log('검색 텍스트 일부:', searchText.slice(0, 500))

  // 3. 로그인
  console.log('\n--- 로그인 ---')
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' })
  await page.fill('input[type="email"]', 'owner@mimiall.test')
  await page.fill('input[type="password"]', 'test1234')
  await page.click('button[type="submit"]')
  await page.waitForTimeout(5000)
  await page.screenshot({ path: 'C:/Users/leesk0130/Desktop/Claude/ss-after-login.png' })
  console.log('로그인 후 URL:', page.url())

  // 4. 대시보드
  console.log('\n--- 대시보드 ---')
  await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' })
  await page.waitForTimeout(5000)
  await page.screenshot({ path: 'C:/Users/leesk0130/Desktop/Claude/ss-dashboard.png' })
  const dashText = await page.textContent('body')
  console.log('대시보드 텍스트 일부:', dashText.slice(0, 500))

  await browser.close()
}

run().catch(e => console.error('ERROR:', e.message))
