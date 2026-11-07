import { expect, test } from '@playwright/test'

test('responses carry the security headers', async ({ page }) => {
  const response = await page.goto('/')
  const headers = response?.headers() ?? {}

  expect(headers['content-security-policy']).toContain("default-src 'self'")
  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'")
  expect(headers['x-content-type-options']).toBe('nosniff')
  expect(headers['x-frame-options']).toBe('DENY')
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
  expect(headers['permissions-policy']).toContain('camera=()')
})

test('every area loads under the Content Security Policy with no violations', async ({ page }) => {
  const violations: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') violations.push(message.text())
  })

  await page.goto('/')
  for (const area of ['Opportunities', 'Readiness', 'Applications', 'Funding and renewal', 'College desk', 'My funding plan']) {
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: area }).click()
    await expect(page.getByRole('heading', { level: 1, name: area })).toBeVisible()
  }

  expect(violations).toEqual([])
})

test('robots.txt is plain text, not the app', async ({ request }) => {
  const response = await request.get('/robots.txt')

  expect(response.headers()['content-type']).toContain('text/plain')
  expect(await response.text()).toBe('User-agent: *\nAllow: /\n')
})
