import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuthStore } from '../store/auth-store'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token, user, checkAuth, isInitialized } = useAuthStore()
  const location = useLocation()
  const [checking, setChecking] = useState(!isInitialized)

  useEffect(() => {
    if (!isInitialized) {
      checkAuth().finally(() => setChecking(false))
    }
  }, [isInitialized, checkAuth])

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4BA2CE] border-t-transparent" />
      </div>
    )
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}
