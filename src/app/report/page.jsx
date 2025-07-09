import ProtectedRoute from '@/components/ProtectedRoute'
import ReportPage from '@/components/ReportPage' // если ты тоже вынес форму

export default function Page() {
  return (
    <ProtectedRoute>
      <ReportPage />
    </ProtectedRoute>
  )
}
