import { ButtonLink } from '@/components/Button'
import { PageHeader } from '@/components/PageHeader'

export function Component() {
  return (
    <>
      <PageHeader title="Page not found" purpose="This address does not match any page in Grantly." />
      <ButtonLink to="/">Go to My funding plan</ButtonLink>
    </>
  )
}
