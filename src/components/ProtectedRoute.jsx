'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
      } else {
        setIsAuthenticated(true)
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return <div className="p-4">Проверка авторизации...</div>
  }

  if (!isAuthenticated) {
    return null // Пока редирект, ничего не показываем
  }

  return children
}
