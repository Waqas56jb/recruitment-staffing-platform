import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import { ToastProvider } from './components/ui/Toast'
import AboutPage from './pages/AboutPage'
import CandidatesPage from './pages/CandidatesPage'
import ContactPage from './pages/ContactPage'
import EmployersPage from './pages/EmployersPage'
import HomePage from './pages/HomePage'
import IndustriesPage from './pages/IndustriesPage'
import JobDetailPage from './pages/JobDetailPage'
import JobsPage from './pages/JobsPage'
import LegalPage from './pages/LegalPage'
import NotFoundPage from './pages/NotFoundPage'
import ServicesPage from './pages/ServicesPage'

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="employers" element={<EmployersPage />} />
          <Route path="candidates" element={<CandidatesPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/:id" element={<JobDetailPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="industries" element={<IndustriesPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<LegalPage type="privacy" />} />
          <Route path="cookies" element={<LegalPage type="cookies" />} />
          <Route path="terms" element={<LegalPage type="terms" />} />
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ToastProvider>
  )
}
