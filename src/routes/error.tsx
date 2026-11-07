import { isRouteErrorResponse, useRouteError } from 'react-router'
import { Button, ButtonLink } from '@/components/Button'
import { PageHeader } from '@/components/PageHeader'

/** True when a lazily loaded page file is missing, usually because a newer version was deployed. */
export function isStaleDeployment(error: unknown): boolean {
  return (
    error instanceof Error && /dynamically imported module|loading chunk|importing a module script/i.test(error.message)
  )
}

/** Describes a routing or rendering error without exposing internal details. */
export function describeError(error: unknown): string {
  if (isRouteErrorResponse(error)) return `The page could not be loaded (${error.status}).`
  if (isStaleDeployment(error)) {
    return 'A newer version of Grantly is available. Reload the page to continue; your saved progress is kept.'
  }
  return 'Something went wrong while showing this page.'
}

/** Shown in place of a page when loading or rendering it fails, so the app never goes blank. */
export function ErrorPage() {
  const error = useRouteError()
  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <PageHeader title="Something went wrong" purpose={describeError(error)} />
      <div className="flex flex-wrap gap-3">
        {isStaleDeployment(error) && <Button onClick={() => window.location.reload()}>Reload page</Button>}
        <ButtonLink to="/" reloadDocument variant={isStaleDeployment(error) ? 'secondary' : 'primary'}>
          Go to My funding plan
        </ButtonLink>
      </div>
    </main>
  )
}
