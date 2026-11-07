import { createBrowserRouter, type RouteObject } from 'react-router'
import { ErrorPage } from '@/routes/error'
import { Shell } from './Shell'

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: Shell,
    hydrateFallbackElement: <p role="status">Loading Grantly</p>,
    errorElement: <ErrorPage />,
    children: [
      { index: true, lazy: () => import('@/routes/plan') },
      { path: 'opportunities', lazy: () => import('@/routes/opportunities') },
      { path: 'readiness', lazy: () => import('@/routes/readiness') },
      { path: 'applications', lazy: () => import('@/routes/applications') },
      { path: 'funding', lazy: () => import('@/routes/funding') },
      { path: 'college', lazy: () => import('@/routes/college') },
      { path: '*', lazy: () => import('@/routes/not-found') },
    ],
  },
]

export const createAppRouter = () => createBrowserRouter(routes)
