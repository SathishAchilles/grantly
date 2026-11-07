import { priya } from '@/data/people'
import type { Person } from '@/domain/types'
import { useGrantlyStore } from '@/store/useGrantlyStore'

/** The person currently selected, falling back to the coordinator if the saved id is unknown. */
export function useActivePerson(): Person {
  const id = useGrantlyStore((state) => state.activePersonId)
  const students = useGrantlyStore((state) => state.students)
  return students.find((student) => student.id === id) ?? priya
}
