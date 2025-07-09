import ProtectedRoute from '@/components/ProtectedRoute'
import Dashboard from '@/components/Dashboard'

export default function HomePage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
}
