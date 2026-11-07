import { useId } from 'react'
import { priya } from '@/data/people'
import { useGrantlyStore } from '@/store/useGrantlyStore'

/** A selector for choosing which student or the college coordinator the app is shown as. */
export function PersonSwitch() {
  const activePersonId = useGrantlyStore((state) => state.activePersonId)
  const students = useGrantlyStore((state) => state.students)
  const setPerson = useGrantlyStore((state) => state.setPerson)
  const hintId = useId()

  return (
    <div className="w-full sm:w-auto">
      <label className="flex w-full items-center gap-2 text-small font-bold text-muted sm:w-auto">
        Viewing as
        <select
          aria-describedby={hintId}
          value={activePersonId}
          onChange={(event) => setPerson(event.target.value)}
          className="min-h-11 min-w-0 flex-1 rounded-pill border-2 border-border bg-surface py-1 pr-3 pl-4 text-small font-bold text-ink shadow-soft sm:flex-none"
        >
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name}, student
            </option>
          ))}
          <option value={priya.id}>{priya.name}, college coordinator</option>
        </select>
      </label>
      <p id={hintId} className="mt-1 text-label text-muted">
        These profiles are fictional. Progress is saved only in this browser.
      </p>
    </div>
  )
}
