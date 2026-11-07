import { useState } from 'react'
import { useGrantlyStore } from '../store/useGrantlyStore'
import { Button } from './Button'

export function ResetDemo() {
  const reset = useGrantlyStore((state) => state.reset)
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState(false)

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-small">Reset all demo progress?</span>
        <Button
          variant="secondary"
          onClick={() => {
            reset()
            setConfirming(false)
            setDone(true)
          }}
        >
          Yes, reset
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
        Reset demo data
      </Button>
      <p role="status" className="text-small text-muted">
        {done ? 'Demo data reset.' : ''}
      </p>
    </div>
  )
}
