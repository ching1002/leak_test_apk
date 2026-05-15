import { createHashRouter, Navigate } from 'react-router-dom'

import { AppShell } from './components/layout/app-shell'
import { RequireAuth } from './components/require-auth'
import { DispatchFormPage } from './pages/dispatch-form-page'
import { DispatchQueryPage } from './pages/dispatch-query-page'
import { LoginPage } from './pages/login-page'
import { ReportPage } from './pages/report-page'

export const router = createHashRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { path: '/dispatch', element: <DispatchQueryPage /> },
      { path: '/dispatch/:caseNo', element: <DispatchFormPage /> },
      { path: '/report', element: <ReportPage /> },
      { path: '/dashboard', element: <Navigate to="/dispatch" replace /> },
    ],
  },
])
