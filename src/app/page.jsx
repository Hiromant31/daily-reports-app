'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import UserSidebar from '@/components/UserSidebar'

import UserDashboard from '@/components/UserDashboard'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('role, email, first_name, last_name, phone')
          .eq('id', user.id)
          .single()
        if (!error) setProfile(profileData)
      }
      setLoading(false)
    }

    fetchUserAndProfile()
  }, [])

  // Перенаправление, если пользователь не авторизован
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    location.reload()
    router.push('/login')
  }

  if (loading || !user) {
    return <div className="p-6 text-center">Загрузка...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Шапка */}
      <header className="bg-white shadow-md px-6 py-4 flex justify-end items-center">
          <div className="flex items-center gap-2">
    {/* Показываем только на мобильных */}
    <div className="md:hidden">
      <UserSidebar user={user} profile={profile} isAdmin={profile?.role === 'admin'} />
    </div>
    <div className='hidden md:block'>
    <button
      className="text-sm text-red-600 hover:underline"
      onClick={handleLogout}
    >
      Выйти
    </button>
    </div>
  </div>
</header>


      <UserDashboard user={user} profile={profile} />
    </div>
  )
}
