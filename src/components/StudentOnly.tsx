import { UserRoundSearch } from 'lucide-react'
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
        <p className="flex max-w-2xl items-start gap-3 rounded-card border border-hairline bg-surface p-5 shadow-soft">
          <UserRoundSearch aria-hidden="true" size={26} strokeWidth={2.2} className="shrink-0 text-forest" />
          This area shows a student's own funding. Choose a student in "Viewing as" to see it, or use College desk.
        </p>
      )}
    </>
  )
}
