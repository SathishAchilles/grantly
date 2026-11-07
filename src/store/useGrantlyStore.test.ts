import { beforeEach, describe, expect, it } from 'vitest'
import { correctionNotice } from '../data/cases'
import { planResponse } from '../domain/caseworker'
import { required, TODAY } from '../test/fixtures'
import { useGrantlyStore } from './useGrantlyStore'

const state = () => useGrantlyStore.getState()
const meera = () => required(state().students.find((student) => student.id === 'meera'), 'Meera')
const renewal = () => required(state().applications.find((application) => application.id === 'meera-pmusp-2026'), 'renewal')
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
    expect(renewal().history.at(-1)).toMatchObject({ date: TODAY, label: 'Requested: Issue an enrolment letter for 2026-27' })
  })

  it("adds a college-confirmed letter to Meera's documents when the college completes the task", () => {
    state().setTaskStatus(requestLetter().id, 'completed', TODAY)

    expect(meera().documents.at(-1)).toMatchObject({ type: 'enrolment-letter', academicYear: '2026-27', basis: 'college-confirmed' })
    expect(renewal()).toMatchObject({ owner: 'student', nextAction: 'Your college issued the letter. Attach it to your correction.' })
    expect(renewal().history.at(-1)?.basis).toBe('college-confirmed')
  })

  it('resubmits the correction when the student attaches the letter, and keeps earlier history', () => {
    state().setTaskStatus(requestLetter().id, 'completed', TODAY)
    state().confirmCaseworkerAction(caseworkerAction(), TODAY)

    expect(renewal().tracks.application).toEqual({ label: 'Correction resubmitted', basis: 'student-reported', date: TODAY })
    expect(renewal().notice).toBeUndefined()
    expect(renewal().history.map((entry) => entry.label)).toContain('Submitted')
    expect(state().tasks.find((task) => task.id === 'task-meera-correction')?.status).toBe('completed')
    expect(state().applications.find((application) => application.id === 'arjun-hdfc-2026')?.owner).toBe('student')
  })

  it('restores everything on reset', () => {
    requestLetter()
    state().setPerson('arjun')
    state().reset()

    expect(state().activePersonId).toBe('meera')
    expect(state().tasks).toHaveLength(4)
    expect(renewal().owner).toBe('student')
  })

  it('persists only data, under a versioned key', () => {
    const options = useGrantlyStore.persist.getOptions()
    const partialize = required(options.partialize, 'partialize')

    expect(options.name).toBe('grantly')
    expect(options.version).toBe(2)
    expect(Object.keys(partialize(state()))).toEqual(['activePersonId', 'students', 'applications', 'tasks'])
  })
})
