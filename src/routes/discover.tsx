import { NotBuilt } from '../components/NotBuilt'
import { PageHeader } from '../components/PageHeader'

export function Component() {
  return (
    <>
      <PageHeader title="Discover" purpose="Find scholarships you can trust, without creating an account first." />
      <NotBuilt
        items={[
          'Search and filter government, corporate, foundation and college awards',
          'Check each provider, official source and last-checked date',
          'See which criteria you meet, do not meet, or still need to answer',
        ]}
      />
    </>
  )
}
