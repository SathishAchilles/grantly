import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { applications } from '@/data/cases'
import { sources } from '@/data/sources'
import type { Application } from '@/domain/types'
import { renewalStudent, required } from '@/test/fixtures'
import { Caseworker } from './Caseworker'
import { DeadlineView } from './DeadlineView'
import { Money } from './Money'
import { SourceLink } from './SourceLink'

describe('Money', () => {
  it('formats rupees the Indian way', () => {
    render(<Money amount={120000} />)
    expect(screen.getByText('₹1,20,000')).toBeInTheDocument()
  })
})

describe('SourceLink', () => {
  it('opens the source in a new tab safely and says so', () => {
    render(<SourceLink source={sources.ffe} />)

    const link = screen.getByRole('link', { name: /Source: Foundation For Excellence scholarships page/ })
    expect(link).toHaveAttribute('href', 'https://ffe.org/scholarships/')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(link).toHaveAccessibleName(/opens in a new tab/)
  })

  it('accepts a custom label', () => {
    render(<SourceLink source={sources.ffe} label="Provider" />)
    expect(screen.getByRole('link', { name: /^Provider:/ })).toBeInTheDocument()
  })
})

describe('DeadlineView', () => {
  it('marks a single passed deadline', () => {
    render(
      <DeadlineView
        deadline={{ status: 'single', option: { date: '2026-10-01', source: sources.hdfcEcss, passed: true } }}
        confirmWith="HDFC"
      />,
    )
    expect(screen.getByText(/\(passed\)/)).toBeInTheDocument()
  })

  it('says when every conflicting date has passed, and who can confirm', () => {
    render(
      <DeadlineView
        deadline={{
          status: 'conflict',
          recommended: null,
          options: [
            { date: '2026-10-31', source: sources.nspAnnouncement, passed: true },
            { date: '2026-11-01', source: sources.nspCatalogue, passed: true },
          ],
        }}
        confirmWith="the provider"
      />,
    )
    expect(screen.getByText(/Every listed date has passed\. Confirm with the provider\./)).toBeInTheDocument()
  })
})

describe('Caseworker', () => {
  const [renewal, hdfc] = [
    required(
      applications.find((application) => application.id === 'meera-pmusp-2026'),
      'renewal',
    ),
    required(
      applications.find((application) => application.id === 'arjun-hdfc-2026'),
      'hdfc',
    ),
  ] as [Application, Application]

  it('falls back to the first application if the selected one disappears', async () => {
    const user = userEvent.setup()
    const student = renewalStudent()
    const { rerender } = render(<Caseworker student={student} applications={[renewal, hdfc]} />)

    await user.selectOptions(screen.getByRole('combobox', { name: 'Application' }), 'HDFC Parivartan ECSS, 2026-27')
    rerender(<Caseworker student={student} applications={[renewal]} />)
    await user.type(screen.getByRole('textbox', { name: 'Notice text' }), 'Please attend an interview.')
    await user.click(screen.getByRole('button', { name: 'Read notice' }))

    expect(screen.getByText('Read the notice for 2026-27.')).toBeInTheDocument()
  })
})
