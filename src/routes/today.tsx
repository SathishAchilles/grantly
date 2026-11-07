import { NotBuilt } from '../components/NotBuilt'
import { PageHeader } from '../components/PageHeader'

export function Component() {
  return (
    <>
      <PageHeader title="Today" purpose="See what needs you now, and whether the money will arrive in time." />
      <NotBuilt
        items={[
          'See your funding gap for each date a payment is due',
          'Act on your most urgent task first',
          'See who must act next on each application',
        ]}
      />
    </>
  )
}
