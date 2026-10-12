import { Navigate, Route, Routes } from 'react-router-dom'
import RequireAuth from './components/auth/RequireAuth'
import AppShell from './components/layout/AppShell'
import { ToastProvider } from './components/ui/Toast'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import SiteLoginRedirect from './components/auth/SiteLoginRedirect'
import DashboardPage from './pages/DashboardPage'
import CompaniesPage from './pages/CompaniesPage'
import CompanyDetailPage from './pages/CompanyDetailPage'
import CandidatesPage from './pages/CandidatesPage'
import CandidateDetailPage from './pages/CandidateDetailPage'
import StaffingRequestsPage from './pages/StaffingRequestsPage'
import StaffingRequestDetailPage from './pages/StaffingRequestDetailPage'
import JobsPage from './pages/JobsPage'
import JobDetailPage from './pages/JobDetailPage'
import JobFormPage from './pages/JobFormPage'
import RecruitmentPage from './pages/RecruitmentPage'
import InterviewsPage from './pages/InterviewsPage'
import PlacementsPage from './pages/PlacementsPage'
import PlacementDetailPage from './pages/PlacementDetailPage'
import WorkforcePage from './pages/WorkforcePage'
import WorkforceDetailPage from './pages/WorkforceDetailPage'
import TimesheetsPage from './pages/TimesheetsPage'
import TimesheetDetailPage from './pages/TimesheetDetailPage'
import DocumentsPage from './pages/DocumentsPage'
import PayrollPage from './pages/PayrollPage'
import PayrollDetailPage from './pages/PayrollDetailPage'
import InvoicesPage from './pages/InvoicesPage'
import InvoiceDetailPage from './pages/InvoiceDetailPage'
import InvoiceFormPage from './pages/InvoiceFormPage'
import ReportsPage from './pages/ReportsPage'
import NotificationsPage from './pages/NotificationsPage'
import UsersPage from './pages/UsersPage'
import RolesPage from './pages/RolesPage'
import AuditLogPage from './pages/AuditLogPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <AuthProvider portal="admin">
      <DataProvider audience="admin">
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
              <Route path="companies" element={<CompaniesPage />} />
              <Route path="companies/:id" element={<CompanyDetailPage />} />
              <Route path="candidates" element={<CandidatesPage />} />
              <Route path="candidates/:id" element={<CandidateDetailPage />} />
              <Route path="staffing-requests" element={<StaffingRequestsPage />} />
              <Route path="staffing-requests/:id" element={<StaffingRequestDetailPage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="jobs/new" element={<JobFormPage />} />
              <Route path="jobs/:id/edit" element={<JobFormPage />} />
              <Route path="jobs/:id" element={<JobDetailPage />} />
              <Route path="recruitment" element={<RecruitmentPage />} />
              <Route path="interviews" element={<InterviewsPage />} />
              <Route path="placements" element={<PlacementsPage />} />
              <Route path="placements/:id" element={<PlacementDetailPage />} />
              <Route path="workforce" element={<WorkforcePage />} />
              <Route path="workforce/:id" element={<WorkforceDetailPage />} />
              <Route path="timesheets" element={<TimesheetsPage />} />
              <Route path="timesheets/:id" element={<TimesheetDetailPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="payroll" element={<PayrollPage />} />
              <Route path="payroll/:id" element={<PayrollDetailPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="invoices/new" element={<InvoiceFormPage />} />
              <Route path="invoices/:id" element={<InvoiceDetailPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="audit-log" element={<AuditLogPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
  )
}
