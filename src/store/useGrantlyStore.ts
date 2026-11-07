import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { applications as initialApplications, tasks as initialTasks } from '@/data/cases'
import { arjun, meera, people } from '@/data/people'
import { schemes } from '@/data/schemes'
import type { ProposedAction } from '@/domain/caseworker'
import type { EmailChange, EmailOutcome } from '@/domain/email'
import type { Application, StatusBasis, Student, Task, TaskStatus } from '@/domain/types'

/** The saved state: who is active and the records that can change. */
export interface GrantlyData {
  activePersonId: string
  students: Student[]
  applications: Application[]
  tasks: Task[]
  processedEmailIds: string[]
}

interface GrantlyActions {
  setPerson: (id: string) => void
  setTaskStatus: (taskId: string, status: TaskStatus, today: string) => void
  confirmCaseworkerAction: (action: ProposedAction, today: string) => void
  applyEmailUpdates: (outcomes: EmailOutcome[], today: string) => void
  reset: () => void
}

/** The saved data together with the actions that change it. */
export type GrantlyState = GrantlyData & GrantlyActions

type Records = Pick<GrantlyData, 'students' | 'applications' | 'tasks'>

const initialData = (): GrantlyData =>
  structuredClone({
    activePersonId: meera.id,
    students: [meera, arjun],
    applications: initialApplications,
    tasks: initialTasks,
    processedEmailIds: [],
  })

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const isArrayOf = (value: unknown, check: (item: unknown) => boolean): boolean => Array.isArray(value) && value.every(check)

const knownSchemeIds = new Set(schemes.map((scheme) => scheme.id))
const knownPersonIds = new Set(people.map((person) => person.id))

/**
 * Checks that saved progress has the shape the app expects before it is loaded.
 * Edited, corrupted or outdated `localStorage` data fails the check and the starting state is used instead.
 */
export function isGrantlyData(value: unknown): value is GrantlyData {
  if (!isObject(value)) return false
  return (
    typeof value.activePersonId === 'string' &&
    knownPersonIds.has(value.activePersonId) &&
    isArrayOf(value.students, (student) => isObject(student) && typeof student.id === 'string') &&
    isArrayOf(
      value.applications,
      (application) =>
        isObject(application) &&
        typeof application.id === 'string' &&
        typeof application.schemeId === 'string' &&
        knownSchemeIds.has(application.schemeId) &&
        Array.isArray(application.history) &&
        isObject(application.tracks),
    ) &&
    isArrayOf(value.tasks, (task) => isObject(task) && typeof task.id === 'string' && typeof task.applicationId === 'string') &&
    isArrayOf(value.processedEmailIds, (id) => typeof id === 'string')
  )
}

const withApplication = (records: Records, id: string, update: (application: Application) => Application): Records => ({
  ...records,
  applications: records.applications.map((application) => (application.id === id ? update(application) : application)),
})

/** Marks a task completed and, when it produces a document, gives that document to the student. */
export function completeTask(records: Records, taskId: string, today: string, basis: StatusBasis): Records {
  const task = records.tasks.find((candidate) => candidate.id === taskId)
  if (!task) return records
  const next = { ...records, tasks: records.tasks.map((candidate) => (candidate.id === taskId ? { ...candidate, status: 'completed' as const } : candidate)) }
  const { fulfils } = task
  if (!fulfils) return next
  const students = next.students.map((student) =>
    student.id === task.studentId ? { ...student, documents: [...student.documents, { ...fulfils, id: `${task.id}-doc`, basis }] } : student,
  )
  return withApplication({ ...next, students }, task.applicationId, (application) => ({
    ...application,
    owner: 'student',
    nextAction: 'Your college issued the letter. Attach it to your correction.',
    history: [...application.history, { date: today, track: 'application', label: `${fulfils.label} issued by college`, basis }],
  }))
}

const note = (subject: string) => `From email: ${subject}`

function applyChange(records: Records, change: EmailChange, subject: string, today: string): Records {
  switch (change.type) {
    case 'application-status':
      return withApplication(records, change.applicationId, (application) => ({
        ...application,
        owner: change.owner,
        tracks: { ...application.tracks, application: { label: change.label, basis: 'evidence', date: today } },
        history: [...application.history, { date: today, track: 'application', label: change.label, basis: 'evidence', note: note(subject) }],
      }))
    case 'payment':
      return withApplication(records, change.applicationId, (application) => ({
        ...application,
        tracks: { ...application.tracks, payment: { label: change.label, basis: 'evidence', date: today } },
        history: [...application.history, { date: today, track: 'payment', label: change.label, basis: 'evidence', note: note(subject) }],
      }))
    case 'support-confirmed':
      return {
        ...records,
        students: records.students.map((student) =>
          student.id === change.studentId
            ? { ...student, support: student.support.map((item) => (item.id === change.supportId ? { ...item, state: 'confirmed' as const } : item)) }
            : student,
        ),
      }
    case 'task': {
      const task: Task = { ...change.task, id: `task-${records.tasks.length + 1}`, status: 'requested' }
      return withApplication({ ...records, tasks: [...records.tasks, task] }, task.applicationId, (application) => ({
        ...application,
        history: [...application.history, { date: today, track: 'application', label: `Task added: ${task.title}`, basis: 'evidence', note: note(subject) }],
      }))
    }
    case 'complete-task':
      return completeTask(records, change.taskId, today, 'evidence')
    case 'add-document':
      return {
        ...records,
        students: records.students.map((student) =>
          student.id === change.studentId ? { ...student, documents: [...student.documents, { ...change.doc, basis: 'evidence' }] } : student,
        ),
      }
  }
}

/** Applies the changes from emails that produced an update and marks all the given emails as processed. */
export function applyEmailOutcomes(data: GrantlyData, outcomes: EmailOutcome[], today: string): GrantlyData {
  let records: Records = { students: data.students, applications: data.applications, tasks: data.tasks }
  for (const outcome of outcomes) {
    if (outcome.kind !== 'update') continue
    for (const change of outcome.changes) records = applyChange(records, change, outcome.email.subject, today)
  }
  return { ...data, ...records, processedEmailIds: [...data.processedEmailIds, ...outcomes.map((outcome) => outcome.email.id)] }
}

/** The app store. Progress is saved in `localStorage` and restored when the shape is valid. */
export const useGrantlyStore = create<GrantlyState>()(
  persist(
    (set) => ({
      ...initialData(),

      setPerson: (id) => set({ activePersonId: id }),

      setTaskStatus: (taskId, status, today) =>
        set((state) => {
          if (!state.tasks.some((task) => task.id === taskId)) return state
          if (status === 'completed') return completeTask(state, taskId, today, 'college-confirmed')
          return { tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)) }
        }),

      confirmCaseworkerAction: (action, today) =>
        set((state) => {
          if (action.type === 'create-task') {
            const task: Task = { ...action.task, id: `task-${state.tasks.length + 1}`, status: 'requested' }
            const updated = withApplication(state, task.applicationId, (application) => ({
              ...application,
              owner: task.owner,
              nextAction: task.title,
              history: [...application.history, { date: today, track: 'application', label: `Requested: ${task.title}`, basis: 'student-reported' }],
            }))
            return { tasks: [...state.tasks, task], applications: updated.applications }
          }
          const updated = withApplication(state, action.applicationId, (application) => ({
            ...application,
            owner: 'institution',
            nextAction: 'Wait for your institute to verify the corrected application.',
            notice: undefined,
            tracks: { ...application.tracks, application: { label: 'Correction resubmitted', basis: 'student-reported', date: today } },
            history: [
              ...application.history,
              { date: today, track: 'application', label: 'Correction resubmitted', basis: 'student-reported', note: `Attached: ${action.doc.label} (${action.doc.academicYear})` },
            ],
          }))
          return {
            applications: updated.applications,
            tasks: state.tasks.map((task) =>
              task.applicationId === action.applicationId && task.owner === 'student' ? { ...task, status: 'completed' as const } : task,
            ),
          }
        }),

      applyEmailUpdates: (outcomes, today) => set((state) => applyEmailOutcomes(state, outcomes, today)),

      reset: () => set(initialData()),
    }),
    {
      name: 'grantly',
      version: 3,
      // Older versions are discarded rather than migrated; the starting state is used instead.
      migrate: () => initialData(),
      merge: (persisted, current) => (isGrantlyData(persisted) ? { ...current, ...persisted } : current),
      partialize: ({ activePersonId, students, applications, tasks, processedEmailIds }) => ({
        activePersonId,
        students,
        applications,
        tasks,
        processedEmailIds,
      }),
    },
  ),
)
