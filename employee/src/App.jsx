import { Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './components/auth/RequireAuth'
import AppShell from './components/layout/AppShell'
import { ToastProvider } from './components/ui/Toast'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import SiteLoginRedirect from './components/auth/SiteLoginRedirect'
import DashboardPage from './pages/DashboardPage'
import StaffingRequestsPage from './pages/StaffingRequestsPage'
import StaffingRequestFormPage from './pages/StaffingRequestFormPage'
import StaffingRequestDetailPage from './pages/StaffingRequestDetailPage'
import CandidatesPage from './pages/CandidatesPage'
import CandidateDetailPage from './pages/CandidateDetailPage'
import PlacementsPage from './pages/PlacementsPage'
import PlacementDetailPage from './pages/PlacementDetailPage'
import WorkforcePage from './pages/WorkforcePage'
import WorkforceDetailPage from './pages/WorkforceDetailPage'
import TimesheetsPage from './pages/TimesheetsPage'
import TimesheetDetailPage from './pages/TimesheetDetailPage'
import DocumentsPage from './pages/DocumentsPage'
import InvoicesPage from './pages/InvoicesPage'
import InvoiceDetailPage from './pages/InvoiceDetailPage'
import ReportsPage from './pages/ReportsPage'
import CompanyPage from './pages/CompanyPage'
import TeamPage from './pages/TeamPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <AuthProvider portal="employee">
      <DataProvider audience="employee">
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<SiteLoginRedirect />} />
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
              <Route path="staffing-requests" element={<StaffingRequestsPage />} />
              <Route path="staffing-requests/new" element={<StaffingRequestFormPage />} />
              <Route path="staffing-requests/:id/edit" element={<StaffingRequestFormPage />} />
              <Route path="staffing-requests/:id" element={<StaffingRequestDetailPage />} />
              <Route path="candidates" element={<CandidatesPage />} />
              <Route path="candidates/:id" element={<CandidateDetailPage />} />
              <Route path="placements" element={<PlacementsPage />} />
              <Route path="placements/:id" element={<PlacementDetailPage />} />
              <Route path="workforce" element={<WorkforcePage />} />
              <Route path="workforce/:id" element={<WorkforceDetailPage />} />
              <Route path="timesheets" element={<TimesheetsPage />} />
              <Route path="timesheets/:id" element={<TimesheetDetailPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="invoices/:id" element={<InvoiceDetailPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="company" element={<CompanyPage />} />
              <Route path="team" element={<TeamPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  )
}
