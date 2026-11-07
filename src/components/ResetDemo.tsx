import { useState } from 'react'
import { useGrantlyStore } from '@/store/useGrantlyStore'
import { Button } from './Button'

/** A start-over control that asks for confirmation before clearing all saved progress, then confirms that it was cleared. */
export function ResetDemo() {
  const reset = useGrantlyStore((state) => state.reset)
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState(false)

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-small">Clear all progress and start over?</span>
        <Button
          variant="secondary"
          onClick={() => {
            reset()
            setConfirming(false)
            setDone(true)
          }}
        >
          Yes, start over
        </Button>
        <Button variant="secondary" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="secondary"
        onClick={() => {
          setDone(false)
          setConfirming(true)
        }}
      >
        Start over
      </Button>
      <p role="status" className="text-small text-muted">
        {done ? 'Progress cleared.' : ''}
      </p>
    </div>
  )
}
