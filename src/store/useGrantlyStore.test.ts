import { beforeEach, describe, expect, it } from 'vitest'
import { correctionNotice } from '@/data/cases'
import { mailbox } from '@/data/emails'
import { planResponse } from '@/domain/caseworker'
import { readEmail } from '@/domain/email'
import { required, TODAY } from '@/test/fixtures'
import { completeTask, isGrantlyData, useGrantlyStore } from './useGrantlyStore'

const state = () => useGrantlyStore.getState()
const meera = () =>
  required(
    state().students.find((student) => student.id === 'meera'),
    'Meera',
  )
const renewal = () =>
  required(
    state().applications.find((application) => application.id === 'meera-pmusp-2026'),
    'renewal',
  )
const caseworkerAction = () => required(planResponse(correctionNotice, meera(), renewal()).action, 'an action')

const requestLetter = () => {
  state().confirmCaseworkerAction(caseworkerAction(), TODAY)
  return required(state().tasks.at(-1), 'the new task')
}

describe('useGrantlyStore', () => {
  beforeEach(() => state().reset())

  it('starts as Meera with the seeded students, applications and tasks', () => {
    expect(state().activePersonId).toBe('meera')
    expect(state().students.map((student) => student.id)).toEqual(['meera', 'arjun'])
    expect(state().applications).toHaveLength(4)
    expect(state().tasks).toHaveLength(4)
  })

  it('switches person', () => {
    state().setPerson('priya')
    expect(state().activePersonId).toBe('priya')
  })

  it('ignores an unknown task and updates a status without side effects', () => {
    const before = state()
    state().setTaskStatus('missing', 'completed', TODAY)
    expect(state().tasks).toBe(before.tasks)

    state().setTaskStatus('task-ayesha-verify', 'acknowledged', TODAY)
    expect(state().tasks.find((task) => task.id === 'task-ayesha-verify')?.status).toBe('acknowledged')

    state().setTaskStatus('task-ayesha-verify', 'completed', TODAY)
    expect(state().students).toBe(before.students)
  })

  it('creates a college task from the caseworker and hands the application to the college', () => {
    const task = requestLetter()

    expect(task).toMatchObject({ id: 'task-5', owner: 'institution', status: 'requested' })
    expect(renewal()).toMatchObject({ owner: 'institution', nextAction: 'Issue an enrolment letter for 2026-27' })
    expect(renewal().history.at(-1)).toMatchObject({
      date: TODAY,
      label: 'Requested: Issue an enrolment letter for 2026-27',
    })
  })

  it("adds a college-confirmed letter to Meera's documents when the college completes the task", () => {
    state().setTaskStatus(requestLetter().id, 'completed', TODAY)

    expect(meera().documents.at(-1)).toMatchObject({
      type: 'enrolment-letter',
      academicYear: '2026-27',
      basis: 'college-confirmed',
    })
    expect(renewal()).toMatchObject({
      owner: 'student',
      nextAction: 'Your college issued the letter. Attach it to your correction.',
    })
    expect(renewal().history.at(-1)?.basis).toBe('college-confirmed')
  })

  it('resubmits the correction when the student attaches the letter, and keeps earlier history', () => {
    state().setTaskStatus(requestLetter().id, 'completed', TODAY)
    state().confirmCaseworkerAction(caseworkerAction(), TODAY)

    expect(renewal().tracks.application).toEqual({
      label: 'Correction resubmitted',
      basis: 'student-reported',
      date: TODAY,
    })
    expect(renewal().notice).toBeUndefined()
    expect(renewal().history.map((entry) => entry.label)).toContain('Submitted')
    expect(state().tasks.find((task) => task.id === 'task-meera-correction')?.status).toBe('completed')
    expect(state().applications.find((application) => application.id === 'arjun-hdfc-2026')?.owner).toBe('student')
  })

  it('applies email outcomes with evidence-based history and remembers processed emails', () => {
    const arjun = required(
      state().students.find((student) => student.id === 'arjun'),
      'Arjun',
    )
    const outcomes = mailbox
      .filter((message) => message.studentId === 'arjun')
      .map((message) => readEmail(message, arjun, state().applications, state().tasks))

    state().applyEmailUpdates(outcomes, TODAY)

    const after = required(
      state().students.find((student) => student.id === 'arjun'),
      'Arjun',
    )
    const hdfc = required(
      state().applications.find((application) => application.id === 'arjun-hdfc-2026'),
      'HDFC',
    )
    expect(after.support[0]?.state).toBe('confirmed')
    expect(hdfc.tracks.application).toEqual({ label: 'Submitted', basis: 'evidence', date: TODAY })
    expect(hdfc.owner).toBe('provider')
    expect(hdfc.history.map((entry) => [entry.label, entry.basis])).toEqual(
      expect.arrayContaining([
        ['Submitted', 'evidence'],
        ['Task added: Attend the HDFC Parivartan ECSS interview', 'evidence'],
      ]),
    )
    expect(state().tasks.at(-1)).toMatchObject({
      title: 'Attend the HDFC Parivartan ECSS interview',
      deadline: '2026-11-20',
      status: 'requested',
    })
    expect(state().processedEmailIds).toEqual([
      'arjun-ecss-received',
      'arjun-ecss-interview',
      'arjun-fee-waiver',
      'arjun-prize',
    ])
  })

  it('applies payment, document and task-completion changes from email', () => {
    state().applyEmailUpdates(
      [
        {
          kind: 'update',
          email: required(mailbox[1], 'letter email'),
          summary: '',
          changes: [
            { type: 'payment', applicationId: 'meera-pmusp-2026', label: 'Payment initiated ₹12,000' },
            {
              type: 'add-document',
              studentId: 'meera',
              doc: {
                id: 'd',
                type: 'enrolment-letter',
                label: 'Enrolment letter',
                academicYear: '2026-27',
                issuer: 'Lakeview',
              },
            },
          ],
        },
      ],
      TODAY,
    )
    expect(renewal().tracks.payment).toEqual({ label: 'Payment initiated ₹12,000', basis: 'evidence', date: TODAY })
    expect(meera().documents.at(-1)).toMatchObject({ id: 'd', basis: 'evidence' })
    expect(meera().support[0]?.state).toBe('pending')

    const task = requestLetter()
    state().applyEmailUpdates(
      [
        {
          kind: 'update',
          email: required(mailbox[1], 'letter email'),
          summary: '',
          changes: [{ type: 'complete-task', taskId: task.id }],
        },
      ],
      TODAY,
    )
    expect(state().tasks.find((candidate) => candidate.id === task.id)?.status).toBe('completed')
    expect(meera().documents.at(-1)).toMatchObject({ type: 'enrolment-letter', basis: 'evidence' })
  })

  it('confirms only the matching support item, leaving the others pending', () => {
    useGrantlyStore.setState({
      students: state().students.map((student) =>
        student.id === 'meera'
          ? {
              ...student,
              support: [
                ...student.support,
                { id: 'other', label: 'Other award', amount: 5_000, kind: 'cash' as const, state: 'pending' as const },
              ],
            }
          : student,
      ),
    })

    state().applyEmailUpdates(
      [
        {
          kind: 'update',
          email: required(mailbox[0], 'email'),
          summary: '',
          changes: [{ type: 'support-confirmed', studentId: 'meera', supportId: 'other' }],
        },
      ],
      TODAY,
    )

    expect(meera().support.map((item) => [item.id, item.state])).toEqual([
      ['meera-pmusp-renewal', 'pending'],
      ['other', 'confirmed'],
    ])
  })

  it('completes a task with no document to issue', () => {
    const before = completeTask(state(), 'task-ayesha-verify', TODAY, 'evidence')
    expect(before.tasks.find((task) => task.id === 'task-ayesha-verify')?.status).toBe('completed')
    expect(before.students).toBe(state().students)
    expect(completeTask(state(), 'missing', TODAY, 'evidence')).toBe(state())
  })

  it('restores everything on reset', () => {
    requestLetter()
    state().setPerson('arjun')
    state().reset()

    expect(state().activePersonId).toBe('meera')
    expect(state().tasks).toHaveLength(4)
    expect(renewal().owner).toBe('student')
    expect(state().processedEmailIds).toEqual([])
  })

  it('persists only data, under a versioned key', () => {
    const options = useGrantlyStore.persist.getOptions()
    const partialize = required(options.partialize, 'partialize')

    expect(options.name).toBe('grantly')
    expect(options.version).toBe(3)
    expect(Object.keys(partialize(state()))).toEqual([
      'activePersonId',
      'students',
      'applications',
      'tasks',
      'processedEmailIds',
    ])
  })
})

describe('loading saved progress', () => {
  const saved = () => {
    const { activePersonId, students, applications, tasks, processedEmailIds } = useGrantlyStore.getState()
    return structuredClone({ activePersonId, students, applications, tasks, processedEmailIds })
  }

  it('accepts progress saved by this version', () => {
    expect(isGrantlyData(saved())).toBe(true)
  })

  it('rejects edited, corrupted or unknown data', () => {
    const unknownScheme = saved()
    required(unknownScheme.applications[0], 'application').schemeId = 'not-a-scheme'

    expect(isGrantlyData(null)).toBe(false)
    expect(isGrantlyData('grantly')).toBe(false)
    expect(isGrantlyData({ ...saved(), activePersonId: 'someone-else' })).toBe(false)
    expect(isGrantlyData({ ...saved(), students: null })).toBe(false)
    expect(isGrantlyData({ ...saved(), tasks: [{ id: 1 }] })).toBe(false)
    expect(isGrantlyData({ ...saved(), processedEmailIds: [42] })).toBe(false)
    expect(isGrantlyData(unknownScheme)).toBe(false)
  })

  it('keeps the starting state when saved data is invalid, and discards older versions', () => {
    const options = useGrantlyStore.persist.getOptions()
    const merge = required(options.merge, 'merge')
    const migrate = required(options.migrate, 'migrate')
    const current = useGrantlyStore.getState()

    expect(merge({ students: 'broken' }, current)).toBe(current)
    expect(merge({ ...saved(), activePersonId: 'arjun' }, current).activePersonId).toBe('arjun')
    expect(migrate({ anything: true }, 2)).toMatchObject({ activePersonId: 'meera', processedEmailIds: [] })
  })
})
