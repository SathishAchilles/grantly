import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { applications as initialApplications, tasks as initialTasks } from '../data/cases'
import { arjun, meera } from '../data/people'
import type { ProposedAction } from '../domain/caseworker'
import type { Application, Student, Task, TaskStatus } from '../domain/types'

interface GrantlyData {
  activePersonId: string
  students: Student[]
  applications: Application[]
  tasks: Task[]
}

interface GrantlyActions {
  setPerson: (id: string) => void
  setTaskStatus: (taskId: string, status: TaskStatus, today: string) => void
  confirmCaseworkerAction: (action: ProposedAction, today: string) => void
  reset: () => void
}

export type GrantlyState = GrantlyData & GrantlyActions

const initialData = (): GrantlyData => structuredClone({
  activePersonId: meera.id,
  students: [meera, arjun],
  applications: initialApplications,
  tasks: initialTasks,
})

export const useGrantlyStore = create<GrantlyState>()(
  persist(
    (set) => ({
      ...initialData(),

      setPerson: (id) => set({ activePersonId: id }),

      setTaskStatus: (taskId, status, today) =>
        set((state) => {
          const task = state.tasks.find((candidate) => candidate.id === taskId)
          if (!task) return state
          const tasks = state.tasks.map((candidate) => (candidate.id === taskId ? { ...candidate, status } : candidate))
          const { fulfils } = task
          if (status !== 'completed' || !fulfils) return { tasks }
          const students = state.students.map((student) =>
            student.id === task.studentId
              ? {
                  ...student,
                  documents: [
                    ...student.documents,
                    { ...fulfils, id: `${task.id}-doc`, basis: 'college-confirmed' as const },
                  ],
                }
              : student,
          )
          const applications = state.applications.map((application) =>
            application.id === task.applicationId
              ? {
                  ...application,
                  owner: 'student' as const,
                  nextAction: 'Your college issued the letter. Attach it to your correction.',
                  history: [
                    ...application.history,
                    { date: today, track: 'application' as const, label: `${fulfils.label} issued by college`, basis: 'college-confirmed' as const },
                  ],
                }
              : application,
          )
          return { tasks, students, applications }
        }),

      confirmCaseworkerAction: (action, today) =>
        set((state) => {
          if (action.type === 'create-task') {
            const task: Task = { ...action.task, id: `task-${state.tasks.length + 1}`, status: 'requested' }
            const applications = state.applications.map((application) =>
              application.id === task.applicationId
                ? {
                    ...application,
                    owner: task.owner,
                    nextAction: task.title,
                    history: [...application.history, { date: today, track: 'application' as const, label: `Requested: ${task.title}`, basis: 'student-reported' as const }],
                  }
                : application,
            )
            return { tasks: [...state.tasks, task], applications }
          }
          const applications = state.applications.map((application) =>
            application.id === action.applicationId
              ? {
                  ...application,
                  owner: 'institution' as const,
                  nextAction: 'Wait for your institute to verify the corrected application.',
                  notice: undefined,
                  tracks: { ...application.tracks, application: { label: 'Correction resubmitted', basis: 'student-reported' as const, date: today } },
                  history: [
                    ...application.history,
                    { date: today, track: 'application' as const, label: 'Correction resubmitted', basis: 'student-reported' as const, note: `Attached: ${action.doc.label} (${action.doc.academicYear})` },
                  ],
                }
              : application,
          )
          const tasks = state.tasks.map((task) =>
            task.applicationId === action.applicationId && task.owner === 'student' ? { ...task, status: 'completed' as const } : task,
          )
          return { applications, tasks }
        }),

      reset: () => set(initialData()),
    }),
    {
      name: 'grantly',
      version: 2,
      partialize: ({ activePersonId, students, applications, tasks }) => ({ activePersonId, students, applications, tasks }),
    },
  ),
)
