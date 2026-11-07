import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const areas = [
  { path: '/', label: 'Today' },
  { path: '/discover', label: 'Discover' },
  { path: '/compare', label: 'Compare' },
  { path: '/documents', label: 'Documents' },
  { path: '/applications', label: 'Applications' },
  { path: '/awards', label: 'Awards' },
  { path: '/renewals', label: 'Renewals' },
]

for (const { path, label } of areas) {
  test(`${label} loads directly, has no axe violations and no sideways scroll`, async ({ page }) => {
    await page.goto(path)

    await expect(page.getByRole('heading', { level: 1, name: label })).toBeVisible()
    await expect(page).toHaveTitle(`${label} | GRANTLY`)

    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByRole('link', { name: label })).toHaveAttribute('aria-current', 'page')
    await expect(nav.getByRole('link', { name: label })).toBeInViewport()

    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    expect(overflows).toBe(false)

    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
}

test('refreshing a deep link keeps the page', async ({ page }) => {
  await page.goto('/applications')
  await page.reload()

  await expect(page.getByRole('heading', { level: 1, name: 'Applications' })).toBeVisible()
})

test('the skip link moves keyboard focus to main', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Today' })).toBeVisible()

  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused()

  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
})

test('navigating moves focus to main and changes the URL', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Renewals' }).click()

  await expect(page).toHaveURL(/\/renewals$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Renewals' })).toBeVisible()
  await expect(page.getByRole('main')).toBeFocused()
})

test('an unknown address shows the not-found page', async ({ page }) => {
  await page.goto('/no-such-page')

  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible()
  await page.getByRole('link', { name: 'Go to Today' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Today' })).toBeVisible()
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('transitions are effectively instant', async ({ page }) => {
    await page.goto('/')
    const duration = await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'Today' })
      .evaluate((link) => getComputedStyle(link).transitionDuration)

    expect(parseFloat(duration)).toBeLessThan(0.001)
  })
})
