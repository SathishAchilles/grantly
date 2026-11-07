import { createBrowserRouter, type RouteObject } from 'react-router'
import { Shell } from './Shell'

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: Shell,
    hydrateFallbackElement: <p role="status">Loading Grantly</p>,
    children: [
      { index: true, lazy: () => import('../routes/plan') },
      { path: 'opportunities', lazy: () => import('../routes/opportunities') },
      { path: 'readiness', lazy: () => import('../routes/readiness') },
      { path: 'applications', lazy: () => import('../routes/applications') },
      { path: 'funding', lazy: () => import('../routes/funding') },
      { path: 'college', lazy: () => import('../routes/college') },
      { path: 'combinations', lazy: () => import('../routes/combinations') },
      { path: '*', lazy: () => import('../routes/not-found') },
    ],
  },
]

export const createAppRouter = () => createBrowserRouter(routes)
