import { screen, within } from '@testing-library/react'
import { act } from 'react'
import { describe, expect, it } from 'vitest'
import { useGrantlyStore } from '@/store/useGrantlyStore'
import { renderRoute } from '@/test/render'

const as = (id: string) => act(() => useGrantlyStore.getState().setPerson(id))
const region = (name: string) => screen.getByRole('region', { name })

describe('Readiness page scope and conditions', () => {
  it('labels the applicant type and year behind each count', async () => {
    as('arjun')
    renderRoute('/readiness')

    const ffe = await screen.findByRole('region', { name: 'FFE' })
    expect(within(ffe).getByText(/Checked for fresh applicants, 2026-27\./)).toBeInTheDocument()
    expect(within(ffe).getByText(/Conditional documents that do not apply to you: 1\./)).toBeInTheDocument()
  })

  it('shows a conditional requirement as "Only if" and keeps it out of the count', async () => {
    as('arjun')
    renderRoute('/readiness')

    const ffe = await screen.findByRole('region', { name: 'FFE' })
    const skipped = within(ffe)
      .getAllByRole('listitem')
      .filter((item) => item.textContent?.includes('Income certificate or ITR'))
    expect(skipped).toHaveLength(1)
    expect(within(skipped[0] as HTMLElement).getByText('Only if this applies to you')).toBeInTheDocument()
    expect(
      within(skipped[0] as HTMLElement).getByText('This does not apply to you, so it is not counted.'),
    ).toBeVisible()
    expect(within(ffe).getByText('1 of 3 required documents ready')).toBeInTheDocument()
  })

  it('reports an unclear document year as to confirm, not ready', async () => {
    as('arjun')
    act(() =>
      useGrantlyStore.setState((state) => ({
        students: state.students.map((student) =>
          student.id === 'arjun'
            ? {
                ...student,
                documents: [
                  {
                    id: 'x',
                    type: 'enrolment-letter',
                    label: 'Enrolment letter',
                    issuer: 'College',
                    basis: 'college-confirmed',
                  },
                ],
              }
            : student,
        ),
      })),
    )
    renderRoute('/readiness')

    const hdfc = await screen.findByRole('region', { name: 'HDFC Parivartan ECSS' })
    expect(within(hdfc).getByText(/1 to confirm\./)).toBeInTheDocument()
    expect(within(hdfc).getByText(/The year on your enrolment letter is unclear/)).toBeInTheDocument()
  })
})

describe('Readiness page scheme selection', () => {
  it('opens one scheme from the scheme search parameter', async () => {
    renderRoute('/readiness?scheme=pm-usp-csss')

    expect(await screen.findByRole('region', { name: 'PM-USP CSSS' })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'HDFC Parivartan ECSS' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'PM-USP CSSS' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'PM-USP CSSS' })).toHaveAttribute('href', '/readiness?scheme=pm-usp-csss')
  })

  it('shows every programme for an unknown or closed scheme', async () => {
    renderRoute('/readiness?scheme=nope')

    expect(await screen.findByRole('region', { name: 'PM-USP CSSS' })).toBeInTheDocument()
    expect(region('HDFC Parivartan ECSS')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'All programmes' })).toHaveAttribute('aria-current', 'page')
  })

  it('writes the chosen scheme to the URL and clears it again', async () => {
    const { user, router } = renderRoute('/readiness')

    await user.click(await screen.findByRole('link', { name: 'HDFC Parivartan ECSS' }))
    expect(router.state.location.search).toBe('?scheme=hdfc-ecss')
    expect(screen.queryByRole('region', { name: 'PM-USP CSSS' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'All programmes' }))
    expect(router.state.location.search).toBe('')
    expect(region('PM-USP CSSS')).toBeInTheDocument()
  })
})
