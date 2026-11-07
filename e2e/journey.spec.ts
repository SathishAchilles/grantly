import { expect, test, type Page } from '@playwright/test'

const viewAs = (page: Page, label: string) =>
  page.getByRole('combobox', { name: 'Viewing as' }).selectOption({ label })

const go = (page: Page, area: string) =>
  page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: area }).click()

async function runDemo(page: Page) {
  // Arjun: a fresh applicant whose 84% is not a percentile, and whose documents fit one programme but not another.
  await viewAs(page, 'Arjun Kumar, student')
  await go(page, 'Opportunities')
  const pmUsp = page.getByRole('region', { name: 'PM-USP CSSS' })
  await expect(pmUsp.getByText(/so you cannot apply as a fresh applicant/)).toBeVisible()
  await expect(pmUsp.getByText(/84% is a marks percentage, not a percentile/)).toBeVisible()
  await expect(pmUsp.getByText('Sources disagree on the student deadline')).toBeVisible()

  await go(page, 'Readiness')
  await expect(page.getByRole('region', { name: 'HDFC Parivartan ECSS' }).getByText('Ready with an accepted alternative')).toBeVisible()
  await expect(page.getByRole('region', { name: 'FFE' }).getByText('You need salary slips.', { exact: false })).toBeVisible()

  // Meera: a returned renewal becomes one college task.
  await viewAs(page, 'Meera Krishnan, student')
  await go(page, 'Applications')
  const caseworker = page.getByRole('region', { name: 'Caseworker' })
  await caseworker.getByRole('button', { name: 'Returned: enrolment evidence' }).click()
  await caseworker.getByRole('button', { name: 'Read notice' }).click()
  await caseworker.getByRole('button', { name: 'Confirm' }).click()
  await expect(caseworker.getByRole('status')).toHaveText('Task created: Issue an enrolment letter for 2026-27.')

  // Priya: the college issues the letter.
  await viewAs(page, 'Priya Nair, college coordinator')
  await go(page, 'College desk')
  await page.getByRole('article', { name: 'Issue an enrolment letter for 2026-27' }).getByRole('button', { name: 'Mark complete' }).click()

  // Meera: attaches the college-confirmed letter and resubmits.
  await viewAs(page, 'Meera Krishnan, student')
  await go(page, 'Applications')
  await caseworker.getByRole('button', { name: 'Returned: enrolment evidence' }).click()
  await caseworker.getByRole('button', { name: 'Read notice' }).click()
  await expect(caseworker.getByText(/Attach your 2026-27 enrolment letter/)).toBeVisible()
  await caseworker.getByRole('button', { name: 'Confirm' }).click()
  await expect(caseworker.getByRole('status')).toHaveText('Correction resubmitted.')

  // The timeline keeps every step.
  await go(page, 'Funding and renewal')
  const thisYear = page.getByRole('region', { name: 'PM-USP CSSS, 2026-27' })
  await expect(thisYear.getByRole('list', { name: 'Tracks' }).getByText('Correction resubmitted')).toBeVisible()
  await expect(thisYear.getByText('Enrolment letter issued by college')).toBeVisible()
  await expect(thisYear.getByText(/Correction required/).first()).toBeVisible()
}

test('the full demo runs, resets, and runs again the same way', async ({ page }) => {
  await page.goto('/')
  await runDemo(page)

  await page.getByRole('button', { name: 'Start over' }).click()
  await page.getByRole('button', { name: 'Yes, start over' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Progress cleared.' })).toBeVisible()

  await go(page, 'My funding plan')
  await expect(page.getByRole('region', { name: 'Your funding position, 2026-27' })).toContainText('Still to find₹30,000')
  await runDemo(page)
})
