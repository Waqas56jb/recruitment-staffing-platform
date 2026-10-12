import { Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './components/auth/RequireAuth'
import AppShell from './components/layout/AppShell'
import { ToastProvider } from './components/ui/Toast'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import DashboardPage from './pages/DashboardPage'
import JobsPage from './pages/JobsPage'
import JobDetailPage from './pages/JobDetailPage'
import ApplicationsPage from './pages/ApplicationsPage'
import ApplicationDetailPage from './pages/ApplicationDetailPage'
import SavedJobsPage from './pages/SavedJobsPage'
import ProfilePage from './pages/ProfilePage'
import DocumentsPage from './pages/DocumentsPage'
import InterviewsPage from './pages/InterviewsPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <AuthProvider portal="candidate">
      <DataProvider audience="candidate">
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/"
              element={(
                <RequireAuth>
                  <AppShell />
                </RequireAuth>
              )}
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="jobs/:id" element={<JobDetailPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="applications/:id" element={<ApplicationDetailPage />} />
              <Route path="saved-jobs" element={<SavedJobsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="interviews" element={<InterviewsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  )
}
