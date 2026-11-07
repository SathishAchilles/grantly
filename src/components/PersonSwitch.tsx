import { priya } from '../data/people'
import { useGrantlyStore } from '../store/useGrantlyStore'

export function PersonSwitch() {
  const activePersonId = useGrantlyStore((state) => state.activePersonId)
  const students = useGrantlyStore((state) => state.students)
  const setPerson = useGrantlyStore((state) => state.setPerson)

  return (
    <label className="flex items-center gap-2 text-small font-medium">
      Viewing as
      <select
        value={activePersonId}
        onChange={(event) => setPerson(event.target.value)}
        className="min-h-11 rounded-control border border-border bg-surface px-3 text-small text-ink"
      >
        {students.map((student) => (
          <option key={student.id} value={student.id}>
            {student.name}, student
          </option>
        ))}
        <option value={priya.id}>
          {priya.name}, college coordinator
        </option>
      </select>
    </label>
  )
}
