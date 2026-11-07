import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test("Arjun's application emails update his status, tasks and gap after he confirms", async ({ page }) => {
  await page.goto('/')
  await page.getByRole('combobox', { name: 'Viewing as' }).selectOption({ label: 'Arjun Kumar, student' })

  const position = page.getByRole('region', { name: 'Your funding position, 2026-27' })
  await expect(position).toContainText('Still to find₹80,000')

  const panel = page.getByRole('region', { name: 'Application emails' })
  await panel.getByRole('button', { name: 'Fetch application emails' }).click()
  const emails = panel.getByRole('list', { name: 'Fetched emails' })
  await expect(emails.getByRole('listitem')).toHaveCount(4)
  await expect(emails.getByText('Suspected scam')).toBeVisible()

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])

  await panel.getByRole('button', { name: 'Apply updates' }).click()
  await expect(panel.getByRole('status')).toHaveText('Applied 3 updates.')
  await expect(position).toContainText('Still to find₹60,000')
  await expect(page.getByRole('article', { name: 'Attend the HDFC Parivartan ECSS interview' })).toBeVisible()

  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Applications' }).click()
  const hdfc = page.getByRole('region', { name: 'HDFC Parivartan ECSS, 2026-27' })
  await expect(hdfc.getByText('Submitted', { exact: true })).toBeVisible()
  await expect(hdfc.getByText('Supported by evidence')).toBeVisible()

  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'My funding plan' }).click()
  await page
    .getByRole('region', { name: 'Application emails' })
    .getByRole('button', { name: 'Fetch application emails' })
    .click()
  await expect(page.getByText('No new application emails.')).toBeVisible()
})
