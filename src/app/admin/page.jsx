// app/admin/page.tsx или page.js
import { Suspense } from 'react'
import AdminPage from './AdminComponent' // вынеси логику внутрь Client компонента

export default function Page() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <AdminPage />
    </Suspense>
  )
}
