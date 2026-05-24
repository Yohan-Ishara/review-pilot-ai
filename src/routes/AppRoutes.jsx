import { Navigate, Route, Routes } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Billing from '../pages/Billing'
import Dashboard from '../pages/Dashboard'
import Landing from '../pages/Landing'
import Locations from '../pages/Locations'
import LoginSignup from '../pages/LoginSignup'
import ReviewDetail from '../pages/ReviewDetail'
import Reviews from '../pages/Reviews'
import Settings from '../pages/Settings'
import ProtectedRoute from './ProtectedRoute'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<LoginSignup />} />
      <Route
        element={
          <ProtectedRoute>
            <Sidebar />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/reviews/:id" element={<ReviewDetail />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
