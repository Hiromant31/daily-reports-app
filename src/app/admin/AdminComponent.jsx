'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import UserDashboard from '@/components/UserDashboard'
import UserSidebar from '@/components/UserSidebar'

const ACCENT_COLOR = '#e53740'

export default function AdminPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedUserId = searchParams.get('id')

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState([])
  const [groupedReports, setGroupedReports] = useState({})
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [range, setRange] = useState('week')

  const loadReports = async (range) => {
    setLoading(true)

    const today = new Date()
    let fromDate = new Date()

    switch (range) {
      case 'week': fromDate.setDate(today.getDate() - 7); break
      case 'month': fromDate.setMonth(today.getMonth() - 1); break
      case 'day': fromDate = new Date(); break
      case 'year': fromDate.setFullYear(today.getFullYear() - 1); break
      default: fromDate = new Date(0)
    }

    const fromISO = fromDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('reports')
      .select(`*, profile: user_id (id, email, first_name, last_name, avatar_url, phone, role)`)
      .gte('date', fromISO)
      .order('date', { ascending: false })

    if (error) {
      alert('Ошибка загрузки отчетов: ' + error.message)
      console.error(error)
    } else {
      const grouped = {}
      for (const report of data) {
        if (!grouped[report.user_id]) grouped[report.user_id] = []
        grouped[report.user_id].push(report)
      }
      setReports(data)
      setGroupedReports(grouped)
    }

    setLoading(false)
  }

  useEffect(() => {
    const fetchUserAndReports = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      if (user.email !== 'test4@gmail.com') {
        router.push('/')
        return
      }

      setUser(user)

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Ошибка загрузки профиля:', profileError)
      } else {
        setProfile(profileData)
      }

      await loadReports(range)
    }

    fetchUserAndReports()
  }, [router, range])

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUser(null)
      setSelectedProfile(null)
      return
    }

    const fetchSelectedUserAndProfile = async () => {
      setProfileLoading(true)

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, avatar_url, phone, role')
        .eq('id', selectedUserId)
        .single()

      if (profileError || !profileData) {
        console.error('Ошибка загрузки профиля выбранного пользователя', profileError)
        setSelectedProfile(null)
        setSelectedUser(null)
        setProfileLoading(false)
        return
      }

      setSelectedUser({ id: selectedUserId, email: profileData.email })
      setSelectedProfile(profileData)
      setProfileLoading(false)
    }

    fetchSelectedUserAndProfile()
  }, [selectedUserId])

  const getLastReportDate = (userId) => {
    const userReports = groupedReports[userId] || []
    if (!userReports.length) return null
    return userReports[0].date
  }

  const isYesterdayOrEarlier = (date) => {
    const today = new Date()
    const target = new Date(date)
    return target.toDateString() !== today.toDateString()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="p-4 text-gray-600">Загрузка...</div>

  if (selectedUserId) {
    if (profileLoading || !selectedUser || !selectedProfile) {
      return <div className="p-4 text-gray-600">Загрузка профиля пользователя...</div>
    }

    return (
      <div className="min-h-screen bg-white text-gray-600 p-6">
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 rounded border font-semibold"
            style={{ borderColor: ACCENT_COLOR, color: ACCENT_COLOR }}
          >
            ← Назад
          </button>

          {profile && (
            <div className="md:hidden">
              <UserSidebar user={selectedUser}
    profile={selectedProfile} isAdmin={profile.role === 'admin'} />
            </div>
          )}

          <button
            onClick={handleLogout}
            className="hidden md:block px-4 py-2 rounded border font-semibold"
            style={{ borderColor: ACCENT_COLOR, color: ACCENT_COLOR }}
          >
            Выйти
          </button>
        </div>

        <UserDashboard user={selectedUser} isAdmin={true} profile={selectedProfile} />
      </div>
    )
  }

  const uniqueProfiles = Object.values(groupedReports)
    .map(reports => reports[0]?.profile)
    .filter(Boolean)

  return (
    <motion.div className="min-h-screen bg-white text-gray-600 p-6">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: ACCENT_COLOR }}>Сотрудники</h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 rounded border font-semibold"
            style={{ borderColor: ACCENT_COLOR, color: ACCENT_COLOR }}
          >
            ← Назад
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded border font-semibold"
            style={{ borderColor: ACCENT_COLOR, color: ACCENT_COLOR }}
          >
            Выйти
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {uniqueProfiles.map((profile) => {
          const lastDate = getLastReportDate(profile.id)
          return (
            <Link key={profile.id} href={`/admin?id=${profile.id}`} legacyBehavior>
              <a className="block bg-gray-100 rounded-lg p-4 shadow-sm transition hover:shadow-md hover:bg-[#fce7e7]">
                <div className="flex items-center gap-4 mb-2">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white select-none"
                    style={{ backgroundColor: ACCENT_COLOR }}
                  >
                    {profile.first_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="font-semibold">{profile.first_name} {profile.last_name}</div>
                    <div className={`text-sm ${lastDate && isYesterdayOrEarlier(lastDate) ? 'text-red-600' : 'text-gray-500'}`}>
                      {lastDate ? `Последний отчет: ${new Date(lastDate).toLocaleDateString()}` : 'Нет отчётов'}
                    </div>
                  </div>
                </div>
              </a>
            </Link>
          )
        })}
      </main>
    </motion.div>
  )
}
