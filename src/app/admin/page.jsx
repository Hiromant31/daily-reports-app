'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

const ADMIN_EMAIL = 'test4@gmail.com'

export default function AdminPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedUserId = searchParams.get('id')

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState([])
  const [range, setRange] = useState('week')
  const [groupedReports, setGroupedReports] = useState({})

  useEffect(() => {
    const fetchUserAndReports = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      if (user.email !== ADMIN_EMAIL) {
        router.push('/')
        return
      }

      setUser(user)
      await loadReports('week')
      setLoading(false)
    }
    fetchUserAndReports()
  }, [router])

  const loadReports = async (range) => {
    setLoading(true)

    const today = new Date()
    let fromDate = new Date()

    switch (range) {
      case 'week': fromDate.setDate(today.getDate() - 7); break
      case 'month': fromDate.setMonth(today.getMonth() - 1); break
      case 'year': fromDate.setFullYear(today.getFullYear() - 1); break
      default: fromDate = new Date(0)
    }

    const fromISO = fromDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('reports')
      .select(`*, profile: user_id (id, email, first_name, last_name, avatar_url)`) 
      .gte('date', fromISO)
      .order('date', { ascending: false })

    if (error) {
      alert('Ошибка загрузки отчетов', error.message)
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

  if (loading) return <div className="p-4">Загрузка...</div>

  // Если выбран пользователь, показываем его карточку как на dashboard
  if (selectedUserId) {
    const reports = groupedReports[selectedUserId] || []
    const summary = {
      calls_sellers: 0, calls_buyers: 0, contracts_sellers: 0, contracts_buyers: 0,
      stickers: 0, meetings_sellers: 0, meetings_buyers: 0, sum_price_reduction: 0,
    }
    for (const report of reports) {
      for (const key in summary) {
        summary[key] += report[key] || 0
      }
    }

    const profile = reports[0]?.profile || {}

    return (
      <motion.div className="min-h-screen bg-gray-100 text-gray-800 p-6">
        <div className="mb-6">
          <button onClick={() => router.push('/admin')} className="text-blue-600 underline">← Назад</button>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Карточка сотрудника</h2>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Имя:</strong> {profile.first_name}</p>
          <p><strong>Фамилия:</strong> {profile.last_name}</p>
          <p><strong>Всего отчётов:</strong> {reports.length}</p>

          <h3 className="mt-6 font-semibold">Сводка:</h3>
          <ul className="grid grid-cols-2 gap-2 mt-2">
            <li>Звонки продавцам: {summary.calls_sellers}</li>
            <li>Звонки покупателям: {summary.calls_buyers}</li>
            <li>Договоры продавца: {summary.contracts_sellers}</li>
            <li>Договоры покупателя: {summary.contracts_buyers}</li>
            <li>Стикеры: {summary.stickers}</li>
            <li>Встречи продавец: {summary.meetings_sellers}</li>
            <li>Встречи покупатель: {summary.meetings_buyers}</li>
            <li>Сумма снижений: {summary.sum_price_reduction.toLocaleString()}</li>
          </ul>
        </div>
      </motion.div>
    )
  }

  // Список сотрудников
  const uniqueProfiles = Object.values(groupedReports).map(reports => reports[0].profile)

  return (
    <motion.div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Сотрудники</h1>
        <select
          value={range}
          onChange={onRangeChange}
          className="text-black px-2 py-1 rounded"
        >
          <option value="week">Неделя</option>
          <option value="month">Месяц</option>
          <option value="year">Год</option>
        </select>
      </header>

      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {uniqueProfiles.map((profile) => {
          const lastDate = getLastReportDate(profile.id)
          return (
            <Link key={profile.id} href={`/admin?id=${profile.id}`}>
              <div className="bg-gray-800 p-4 rounded hover:bg-gray-700 transition cursor-pointer">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-indigo-400 text-white rounded-full flex items-center justify-center text-lg font-bold">
                    {profile.first_name?.[0]?.toUpperCase() || '?'}</div>
                  <div>
                    <div className="font-semibold">{profile.first_name} {profile.last_name}</div>
                    <div className={`text-sm ${lastDate && isYesterdayOrEarlier(lastDate) ? 'text-red-400' : 'text-gray-300'}`}>
                      {lastDate ? `Последний отчет: ${new Date(lastDate).toLocaleDateString()}` : 'Нет отчётов'}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </main>
    </motion.div>
  )
}
