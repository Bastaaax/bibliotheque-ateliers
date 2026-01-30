import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { useAuth } from './hooks/useAuth'
import { Layout } from './components/layout/Layout'
import { LoadingSpinner } from './components/common/LoadingSpinner'
import { Toaster } from './components/ui/toaster'
import Dashboard from './pages/Dashboard'
import WorkshopDetailPage from './pages/WorkshopDetailPage'
import WorkshopEditPage from './pages/WorkshopEditPage'
import IntegrationsPage from './pages/IntegrationsPage'
import TagsManagementPage from './pages/TagsManagementPage'
import UsersManagementPage from './pages/UsersManagementPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode
  adminOnly?: boolean
}) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()

  if (isLoading) return <LoadingSpinner fullScreen message="Chargement..." />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />

  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="workshops/:id" element={<WorkshopDetailPage />} />
            <Route path="workshops/:id/edit" element={<WorkshopEditPage />} />
            <Route path="workshops/new" element={<WorkshopEditPage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route
              path="tags"
              element={
                <ProtectedRoute adminOnly>
                  <TagsManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute adminOnly>
                  <UsersManagementPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
