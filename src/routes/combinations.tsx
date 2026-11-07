import { NotBuilt } from '../components/NotBuilt'
import { PageHeader } from '../components/PageHeader'

export function Component() {
  return (
    <>
      <PageHeader title="Combinations" purpose="Check whether two benefits can be held together, under both schemes' rules." />
      <NotBuilt
        items={[
          'Compare what you already receive with what you are applying for',
          'Show compatible, conditional, conflicting or needs confirmation for each pair',
          'Explain which rule on which side decides it',
        ]}
      />
    </>
  )
}
