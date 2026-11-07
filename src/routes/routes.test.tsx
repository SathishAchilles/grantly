import { screen, within } from '@testing-library/react'
import { act } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { correctionNotice } from '../data/cases'
import { useGrantlyStore } from '../store/useGrantlyStore'
import { required } from '../test/fixtures'
import { axeViolations, renderRoute } from '../test/render'

const store = () => useGrantlyStore.getState()
const as = (id: string) => act(() => store().setPerson(id))
const region = (name: string | RegExp) => screen.getByRole('region', { name })

const meeraTasks = (overrides: Partial<ReturnType<typeof store>['tasks'][number]>[]) =>
  useGrantlyStore.setState({
    tasks: overrides.map((override, index) => ({
      ...required(store().tasks[0], 'a task'),
      id: `t${index}`,
      ...override,
    })),
  })

describe('My funding plan', () => {
  it("shows Meera's ₹30,000 gap and keeps her pending ₹12,000 out of it", async () => {
    renderRoute('/')

    const position = await screen.findByRole('region', { name: 'Your funding position, 2026-27' })
    expect(within(position).getByRole('definition', { name: 'Still to find' })).toHaveTextContent('₹30,000')
    expect(within(position).getByRole('heading', { name: 'Pending, not counted in your gap' })).toBeInTheDocument()
    expect(within(position).getByText(/PM-USP CSSS renewal, 2026-27/)).toHaveTextContent('(Paid to you)')
    expect(within(position).getByText('₹12,000')).toBeInTheDocument()
  })

  it("lists Meera's next action, which she owns", async () => {
    renderRoute('/')

    const actions = await screen.findByRole('region', { name: 'Next actions' })
    expect(within(actions).getByRole('heading', { name: 'Respond to the PM-USP correction request' })).toBeInTheDocument()
    expect(within(actions).queryByText(/Your part is done/)).not.toBeInTheDocument()
  })

  it("shows Arjun has no support yet and that his task waits on his family", async () => {
    as('arjun')
    renderRoute('/')

    const position = await screen.findByRole('region', { name: 'Your funding position, 2026-27' })
    expect(within(position).getByRole('definition', { name: 'Still to find' })).toHaveTextContent('₹80,000')
    expect(within(position).getByText('No scholarship support yet. See Opportunities.')).toBeInTheDocument()
    const actions = region('Next actions')
    expect(within(actions).getByText('Your part is done. Waiting on: Family.')).toBeInTheDocument()
    expect(within(actions).getByText('No published deadline')).toBeInTheDocument()
  })

  it('counts confirmed support and describes a fee reduction as not cash', async () => {
    const meera = required(store().students[0], 'Meera')
    useGrantlyStore.setState({
      students: [{ ...meera, support: [{ id: 'c', label: 'College fee concession', amount: 20_000, kind: 'fee-reduction', state: 'confirmed' }] }],
    })
    renderRoute('/')

    const position = await screen.findByRole('region', { name: 'Your funding position, 2026-27' })
    expect(within(position).getByRole('definition', { name: 'Still to find' })).toHaveTextContent('₹10,000')
    expect(within(position).getByRole('heading', { name: 'Confirmed support' })).toBeInTheDocument()
    expect(within(position).getByText(/College fee concession/)).toHaveTextContent('Reduces your college fee; not cash')
    expect(within(position).queryByText(/No scholarship support yet/)).not.toBeInTheDocument()
  })

  it('orders actions by deadline, with undated ones last, and says when nothing is due', async () => {
    meeraTasks([
      { title: 'Undated task', deadline: undefined },
      { title: 'Dated task', deadline: '2026-11-20' },
    ])
    renderRoute('/')

    const actions = await screen.findByRole('region', { name: 'Next actions' })
    expect(within(actions).getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual([
      'Dated task',
      'Undated task',
    ])

    act(() => useGrantlyStore.setState({ tasks: [] }))
    expect(await screen.findByText('Nothing needs you right now.')).toBeInTheDocument()
  })

  it('asks a coordinator to choose a student', async () => {
    as('priya')
    renderRoute('/')

    expect(await screen.findByText(/This area shows a student's own funding/)).toBeInTheDocument()
  })
})

describe('Opportunities', () => {
  it("shows Arjun's separate location facts", async () => {
    as('arjun')
    renderRoute('/opportunities')

    expect(await screen.findByText(/Domicile Bihar; studying in Pune, Maharashtra\./)).toBeInTheDocument()
  })

  it('does not offer PM-USP to a fresh applicant, and asks for percentile evidence instead of using 84%', async () => {
    as('arjun')
    renderRoute('/opportunities')

    const card = await screen.findByRole('region', { name: 'PM-USP CSSS' })
    expect(within(card).getByText('Open for renewal applications only in 2026-27, so you cannot apply as a fresh applicant.')).toBeInTheDocument()
    expect(within(card).queryByRole('link', { name: /Check documents/ })).not.toBeInTheDocument()
    expect(within(card).getByText(/84% is a marks percentage, not a percentile/)).toBeInTheDocument()
    expect(within(card).getAllByText('More information needed').length).toBeGreaterThan(0)
    expect(within(card).getByText(/Next: Check whether your board/)).toBeInTheDocument()
    expect(within(card).getByText('Amount:', { exact: false })).toHaveTextContent('₹12,000 a year at graduation level')
  })

  it('shows both NSP deadlines, marks the passed one, and advises acting by 30 Nov', async () => {
    as('arjun')
    renderRoute('/opportunities')

    const card = await screen.findByRole('region', { name: 'PM-USP CSSS' })
    expect(within(card).getByText('Sources disagree on the student deadline')).toBeInTheDocument()
    expect(within(card).getByText('31 Oct 2026 (passed)')).toBeInTheDocument()
    expect(within(card).getByText('30 Nov 2026')).toBeInTheDocument()
    expect(within(card).getByText(/Act by 30 Nov 2026, the earliest date that has not passed\. Confirm with the NSP helpdesk/)).toBeInTheDocument()
  })

  it('shows published amounts with sources, and says when an amount is not published', async () => {
    as('arjun')
    renderRoute('/opportunities')

    const hdfc = await screen.findByRole('region', { name: 'HDFC Parivartan ECSS' })
    expect(within(hdfc).getByText('Amount:', { exact: false })).toHaveTextContent('₹50,000 for your course level')
    expect(within(hdfc).getByText('Meets every listed condition we can check.')).toBeInTheDocument()
    expect(within(hdfc).getByRole('link', { name: 'Check documents for HDFC Parivartan ECSS' })).toHaveAttribute('href', '/readiness')

    const ffe = region('FFE')
    expect(within(ffe).getByText('Amount: Not published by the provider')).toBeInTheDocument()
    expect(within(ffe).getByRole('link', { name: /^Provider: FFE/ })).toHaveAttribute('href', 'https://ffe.org/scholarships/')
    expect(within(ffe).getByText(/FFE has not published a closing date/)).toBeInTheDocument()
    expect(within(ffe).getByText('Rule needs confirmation')).toBeInTheDocument()

    expect(within(region('NMMSS')).getByText('Does not meet at least one listed condition.')).toBeInTheDocument()
  })

  it('states that meeting conditions is not a selection decision', async () => {
    renderRoute('/opportunities')

    const card = await screen.findByRole('region', { name: 'PM-USP CSSS' })
    expect(within(card).getByText(/does not guarantee an award\. Department of Higher Education, Ministry of Education makes the decision\./)).toBeInTheDocument()
    expect(within(card).getByText('Conditions for renewal applicants')).toBeInTheDocument()
    expect(within(card).getByText('68% in 2025-26.')).toBeInTheDocument()
  })
})

describe('Readiness', () => {
  it("shows Arjun's two programmes treating the same income certificate differently", async () => {
    as('arjun')
    renderRoute('/readiness')

    const hdfc = await screen.findByRole('region', { name: 'HDFC Parivartan ECSS' })
    expect(within(hdfc).getByText('Ready with an accepted alternative')).toBeInTheDocument()
    expect(within(hdfc).getByText('4 of 4 documents ready')).toBeInTheDocument()

    const ffe = region('FFE')
    expect(within(ffe).getByText('Not accepted')).toBeInTheDocument()
    expect(within(ffe).getByText('Your income certificate is not accepted here. You need salary slips.')).toBeInTheDocument()
    expect(within(ffe).getByText('Missing')).toBeInTheDocument()
    expect(within(ffe).getByText('1 of 3 documents ready')).toBeInTheDocument()
  })

  it("lists Meera's documents and sends her to the issuer for an outdated letter", async () => {
    renderRoute('/readiness')

    const documents = await screen.findByRole('region', { name: 'Your documents' })
    expect(within(documents).getByText('Enrolment letter, 2025-26')).toBeInTheDocument()
    expect(within(documents).getByText('Bank passbook')).toBeInTheDocument()
    expect(within(region('HDFC Parivartan ECSS')).getByText(/Ask Lakeview Arts and Science College for one covering 2026-27/)).toBeInTheDocument()
    expect(within(region('PM-USP CSSS')).getByText('1 of 1 documents ready')).toBeInTheDocument()
  })
})

describe('Applications and the caseworker', () => {
  it("shows Meera's returned renewal with her as owner and the deadline note", async () => {
    renderRoute('/applications')

    const card = await screen.findByRole('region', { name: 'PM-USP CSSS, 2026-27' })
    expect(within(card).getByText('Correction required')).toBeInTheDocument()
    expect(within(card).getByText('Provider-confirmed')).toBeInTheDocument()
    expect(within(card).getByRole('definition', { name: 'Who acts next' })).toHaveTextContent('Student')
    expect(within(card).getByText(/30 Nov 2026/)).toHaveTextContent(/NSP pages disagree/)
    expect(within(card).getByText(correctionNotice)).toBeInTheDocument()
  })

  it('labels the caseworker as a scripted demo, not AI', async () => {
    renderRoute('/applications')

    const caseworker = await screen.findByRole('region', { name: 'Demo caseworker' })
    expect(within(caseworker).getByText(/Scripted demo: .* It is not AI\./)).toBeInTheDocument()
    expect(within(caseworker).getByRole('button', { name: 'Read notice' })).toBeDisabled()
  })

  it('turns the enrolment notice into a college task only after Meera confirms', async () => {
    const { user } = renderRoute('/applications')
    const caseworker = await screen.findByRole('region', { name: 'Demo caseworker' })

    await user.click(within(caseworker).getByRole('button', { name: 'Returned: enrolment evidence' }))
    expect(within(caseworker).getByRole('textbox', { name: 'Notice text' })).toHaveValue(correctionNotice)
    await user.click(within(caseworker).getByRole('button', { name: 'Read notice' }))

    expect(within(caseworker).getByText('Your enrolment letter is for 2025-26, not 2026-27.')).toBeInTheDocument()
    expect(store().tasks).toHaveLength(4)

    await user.click(within(caseworker).getByRole('button', { name: 'Confirm' }))

    expect(within(caseworker).getByRole('status')).toHaveTextContent('Task created: Issue an enrolment letter for 2026-27.')
    expect(store().tasks).toHaveLength(5)
    expect(within(region('PM-USP CSSS, 2026-27')).getByRole('definition', { name: 'Who acts next' })).toHaveTextContent('College')
  })

  it('does not guess at an unrecognised notice, and shows text as plain text', async () => {
    const { user } = renderRoute('/applications')
    const caseworker = await screen.findByRole('region', { name: 'Demo caseworker' })

    await user.type(within(caseworker).getByRole('textbox', { name: 'Notice text' }), '<img src=x onerror=alert(1)> please call us')
    await user.click(within(caseworker).getByRole('button', { name: 'Read notice' }))

    expect(within(caseworker).getByText(/I will not guess/)).toBeInTheDocument()
    expect(within(caseworker).queryByRole('button', { name: 'Confirm' })).not.toBeInTheDocument()
    expect(within(caseworker).queryByRole('img')).not.toBeInTheDocument()
  })

  it('explains an Aadhaar payment failure with its source, and can be cancelled', async () => {
    const { user } = renderRoute('/applications')
    const caseworker = await screen.findByRole('region', { name: 'Demo caseworker' })

    await user.click(within(caseworker).getByRole('button', { name: 'Payment failed: Aadhaar' }))
    await user.click(within(caseworker).getByRole('button', { name: 'Read notice' }))

    expect(within(caseworker).getByRole('link', { name: /Source: PFMS Aadhaar seeding guide/ })).toBeInTheDocument()
    await user.click(within(caseworker).getByRole('button', { name: 'Cancel' }))
    expect(within(caseworker).queryByText(/NPCI mapper for your account/)).not.toBeInTheDocument()
    expect(store().tasks).toHaveLength(4)
  })

  it("works on Arjun's chosen application", async () => {
    as('arjun')
    const { user } = renderRoute('/applications')
    const caseworker = await screen.findByRole('region', { name: 'Demo caseworker' })

    await user.selectOptions(within(caseworker).getByRole('combobox', { name: 'Application' }), 'FFE, 2026-27')
    await user.click(within(caseworker).getByRole('button', { name: 'Incomplete: missing document' }))
    await user.click(within(caseworker).getByRole('button', { name: 'Read notice' }))
    await user.click(within(caseworker).getByRole('button', { name: 'Confirm' }))

    expect(store().tasks.at(-1)).toMatchObject({ applicationId: 'arjun-ffe-2026', title: 'Add your income certificate' })
    expect(within(region('FFE, 2026-27')).getByText('None published')).toBeInTheDocument()
  })

  it('reveals steps one at a time when motion is allowed', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }))
    const { user } = renderRoute('/applications')
    const caseworker = await screen.findByRole('region', { name: 'Demo caseworker' })

    await user.click(within(caseworker).getByRole('button', { name: 'Returned: enrolment evidence' }))
    await user.click(within(caseworker).getByRole('button', { name: 'Read notice' }))

    expect(within(caseworker).getAllByRole('listitem')).toHaveLength(1)
    expect(await within(caseworker).findByText('Your enrolment letter is for 2025-26, not 2026-27.')).toBeInTheDocument()
  })

  it('says when there are no applications this year', async () => {
    useGrantlyStore.setState({ applications: [] })
    renderRoute('/applications')

    expect(await screen.findByText('No applications for 2026-27 yet. Start from Opportunities.')).toBeInTheDocument()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })
})

describe('Funding and renewal', () => {
  it('keeps application, award, payment and renewal as separate tracks', async () => {
    renderRoute('/funding')

    const lastYear = await screen.findByRole('region', { name: 'PM-USP CSSS, 2025-26' })
    const lastTracks = within(lastYear).getByRole('list', { name: 'Tracks' })
    expect(within(lastTracks).getByText('Received ₹12,000')).toBeInTheDocument()
    expect(within(lastTracks).getByText('Accepted')).toBeInTheDocument()

    const thisYear = region('PM-USP CSSS, 2026-27')
    const tracks = within(thisYear).getByRole('list', { name: 'Tracks' })
    expect(within(tracks).getByText('Correction required')).toBeInTheDocument()
    expect(within(tracks).getAllByText('Not started')).toHaveLength(3)
    expect(within(thisYear).getByText(/Deadline 30 Nov 2026/)).toBeInTheDocument()
  })

  it('preserves earlier history, newest first, with each basis', async () => {
    renderRoute('/funding')

    const thisYear = await screen.findByRole('region', { name: 'PM-USP CSSS, 2026-27' })
    const entries = within(thisYear).getAllByRole('listitem').filter((item) => item.textContent.includes('Application:'))
    expect(entries.map((entry) => entry.textContent)).toEqual([
      expect.stringContaining('Correction required'),
      expect.stringContaining('Submitted'),
    ])
    expect(within(thisYear).getByText('NSP acknowledgement saved.')).toBeInTheDocument()
  })
})

describe('College desk', () => {
  it("lists only Lakeview's college-owned tasks, nearest deadline first, with valid heading order", async () => {
    as('priya')
    const { container } = renderRoute('/college')

    expect(await screen.findByText(/Priya Nair, Scholarship coordinator, Lakeview Arts and Science College/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Waiting on your college' })).toBeInTheDocument()
    expect(await axeViolations(container)).toEqual([])
    expect(screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual([
      'Issue a bonafide certificate',
      'Verify the PM-USP renewal on NSP',
    ])
    expect(screen.queryByText(/salary slips/)).not.toBeInTheDocument()
  })

  it('moves a task through acknowledged, needs clarification and completed', async () => {
    as('priya')
    const { user } = renderRoute('/college')
    const task = await screen.findByRole('article', { name: 'Verify the PM-USP renewal on NSP' })

    await user.click(within(task).getByRole('button', { name: 'Acknowledge' }))
    expect(within(task).getByText('Acknowledged')).toBeInTheDocument()
    expect(within(task).getByRole('button', { name: 'Acknowledge' })).toBeDisabled()

    await user.click(within(task).getByRole('button', { name: 'Needs clarification' }))
    expect(within(task).getByRole('definition', { name: 'Status' })).toHaveTextContent('Needs clarification')
    expect(within(task).getByRole('button', { name: 'Needs clarification' })).toBeDisabled()

    await user.click(within(task).getByRole('button', { name: 'Mark complete' }))
    expect(within(task).getByText('Completed')).toBeInTheDocument()
    expect(within(task).getByRole('button', { name: 'Mark complete' })).toBeDisabled()
  })

  it('puts undated tasks last and says when the queue is empty', async () => {
    useGrantlyStore.setState({
      tasks: store().tasks.map((task) => (task.id === 'task-rahul-bonafide' ? { ...task, deadline: undefined } : task)),
    })
    as('priya')
    renderRoute('/college')

    await screen.findByRole('heading', { name: 'Issue a bonafide certificate' })
    expect(screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual([
      'Verify the PM-USP renewal on NSP',
      'Issue a bonafide certificate',
    ])

    act(() => useGrantlyStore.setState({ tasks: [] }))
    expect(await screen.findByText('No tasks are waiting on your college.')).toBeInTheDocument()
  })

  it('explains itself to a student', async () => {
    renderRoute('/college')

    expect(await screen.findByText(/College desk is for scholarship coordinators/)).toBeInTheDocument()
  })
})

describe('Full correction journey', () => {
  it('Meera asks, Priya issues the letter, and Meera resubmits with it', async () => {
    const { user } = renderRoute('/applications')
    let caseworker = await screen.findByRole('region', { name: 'Demo caseworker' })
    await user.click(within(caseworker).getByRole('button', { name: 'Returned: enrolment evidence' }))
    await user.click(within(caseworker).getByRole('button', { name: 'Read notice' }))
    await user.click(within(caseworker).getByRole('button', { name: 'Confirm' }))

    await user.selectOptions(screen.getByRole('combobox', { name: 'Viewing as' }), 'Priya Nair, college coordinator')
    await user.click(screen.getByRole('link', { name: 'College desk' }))
    const task = await screen.findByRole('article', { name: 'Issue an enrolment letter for 2026-27' })
    await user.click(within(task).getByRole('button', { name: 'Mark complete' }))

    await user.selectOptions(screen.getByRole('combobox', { name: 'Viewing as' }), 'Meera Krishnan, student')
    await user.click(screen.getByRole('link', { name: 'Readiness' }))
    const documents = await screen.findByRole('region', { name: 'Your documents' })
    const letter = within(documents).getAllByRole('listitem').find((item) => item.textContent.includes('Enrolment letter, 2026-27'))
    expect(letter).toHaveTextContent('Confirmed by college staff')

    await user.click(screen.getByRole('link', { name: 'Applications' }))
    caseworker = await screen.findByRole('region', { name: 'Demo caseworker' })
    await user.click(within(caseworker).getByRole('button', { name: 'Returned: enrolment evidence' }))
    await user.click(within(caseworker).getByRole('button', { name: 'Read notice' }))
    expect(within(caseworker).getByText(/Attach your 2026-27 enrolment letter/)).toBeInTheDocument()
    await user.click(within(caseworker).getByRole('button', { name: 'Confirm' }))

    expect(within(caseworker).getByRole('status')).toHaveTextContent('Correction resubmitted.')
    expect(within(region('PM-USP CSSS, 2026-27')).getByText('Correction resubmitted')).toBeInTheDocument()
  })
})
