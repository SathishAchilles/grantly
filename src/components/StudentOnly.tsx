import type { ReactNode } from 'react'
import { useActivePerson } from '../app/useActivePerson'
import type { Student } from '../domain/types'
import { PageHeader } from './PageHeader'

interface StudentOnlyProps {
  title: string
  purpose: string
  children: (student: Student) => ReactNode
}

/** Renders a student area, or asks a coordinator to switch to a student. */
export function StudentOnly({ title, purpose, children }: StudentOnlyProps) {
  const person = useActivePerson()
  return (
    <>
      <PageHeader title={title} purpose={purpose} />
      {person.role === 'student' ? (
        children(person)
      ) : (
        <p className="max-w-2xl">
          This area shows a student's own funding. Choose a student in "Viewing as" to see it, or use College desk.
        </p>
      )}
    </>
  )
}
