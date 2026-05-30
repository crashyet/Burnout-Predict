import { Route, Routes, Navigate } from 'react-router-dom'
import { DailyCheckInPage } from '../pages/DailyCheckInPage'
import { DashboardPage } from '../pages/DashboardPage'
import { JournalPage } from '../pages/JournalPage'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { MoodMapPage } from '../pages/MoodMapPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { OtpVerifyPage } from '../pages/OtpVerifyPage'
import { RegisterPage } from '../pages/RegisterPage'
import { isAuthenticated } from '../services/authService'

interface RouteWrapperProps {
  children: React.ReactNode
}

function ProtectedRoute({ children }: RouteWrapperProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function PublicOnlyRoute({ children }: RouteWrapperProps) {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/daily-checkin" element={<ProtectedRoute><DailyCheckInPage /></ProtectedRoute>} />
      <Route path="/mood-map" element={<ProtectedRoute><MoodMapPage /></ProtectedRoute>} />
      <Route path="/journal" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
      <Route path="/journal-daily" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
      
      {/* Public Only Routes */}
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
      <Route path="/otp-verify" element={<PublicOnlyRoute><OtpVerifyPage /></PublicOnlyRoute>} />
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
