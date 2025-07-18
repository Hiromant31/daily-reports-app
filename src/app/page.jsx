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
    <div className='bg-white pt-2 h-full justify-center'>
<header className="w-full">

    <div className='max-w-4xl px-4 m-auto flex items-center justify-between'>
  {/* Левая часть */}
  <div className="flex items-center gap-2 w-full">
    {/* На мобильных — модуль с кнопкой меню (внутри — имя и кнопка ☰) */}
    <div className="md:hidden w-full">
      <UserSidebar user={user} profile={profile} isAdmin={profile?.role === 'admin'} />
    </div>

    {/* На десктопе — кнопка выйти */}
    <div className="hidden md:block ml-auto">
      <button
        onClick={handleLogout}
        className="px-4 py-2 text-sm font-semibold text-[#eeeeee] bg-red-700 border border-red-200 rounded-full hover:bg-red-400 transition"
      >
        Выйти
      </button>
      <button
            onClick={() => router.push('/owners')}
            className="text-left font-comfortee py-2 px-5 mx-5 rounded bg-red-500 hover:bg-red-900 transition"
          >
            Мои объекты
          </button>
    </div>
  </div>
  </div>
</header>


      <UserDashboard user={user} profile={profile} />
    </div>
  )
}
