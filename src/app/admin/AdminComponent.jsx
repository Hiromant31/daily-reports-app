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
  const [activeTab, setActiveTab] = useState('seller')

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
      await loadReports(range)
      setLoading(false)
    }
    fetchUserAndReports()
  }, [router, range])

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

  const onRangeChange = async (e) => {
    const val = e.target.value
    setRange(val)
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

  if (selectedUserId) {
    const reports = groupedReports[selectedUserId] || []
    const summary = {
      calls_sellers: 0, calls_buyers: 0, contracts_sellers: 0, contracts_buyers: 0,
      stickers: 0, meetings_sellers: 0, meetings_buyers: 0, sum_price_reduction: 0,
      showings_sellers: 0, showings_buyers: 0, statuses: 0, incoming_calls: 0,
      banners: 0, v: 0, objects_uploaded: 0, pro_photos: 0, price_reductions: 0,
    }
    for (const report of reports) {
      for (const key in summary) {
        summary[key] += report[key] || 0
      }
    }

    const profile = reports[0]?.profile || {}

    return (
      <motion.div className="min-h-screen bg-gray-100 text-gray-800 p-6">
        <div className="mb-6 flex justify-between items-center">
          <button onClick={() => router.push('/admin')} className="text-blue-600 underline">← Назад</button>
          <select
            value={range}
            onChange={onRangeChange}
            className="text-black px-2 py-1 rounded border"
          >
            <option value="week">Неделя</option>
            <option value="day">День</option>
            <option value="month">Месяц</option>
            <option value="year">Год</option>
          </select>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Карточка сотрудника</h2>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Имя:</strong> {profile.first_name}</p>
          <p><strong>Фамилия:</strong> {profile.last_name}</p>
          <p><strong>Всего отчётов:</strong> {reports.length}</p>

          <div className="flex mt-6 border-b mb-4">
            <button onClick={() => setActiveTab('seller')} className={`px-4 py-2 font-medium ${activeTab === 'seller' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>Продавец</button>
            <button onClick={() => setActiveTab('buyer')} className={`px-4 py-2 font-medium ${activeTab === 'buyer' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>Покупатель</button>
          </div>

          <ul className="grid grid-cols-2 gap-2 text-sm">
            {activeTab === 'seller' && (
              <>
                <li>Звонки продавцам: {summary.calls_sellers}</li>
                <li>Встречи с продавцами: {summary.meetings_sellers}</li>
                <li>Договоры с продавцами: {summary.contracts_sellers}</li>
                <li>Показы продавцам: {summary.showings_sellers}</li>
                <li>Баннеры: {summary.banners}</li>
                <li>Аналитика: {summary.v}</li>
                <li>Объекты внесены: {summary.objects_uploaded}</li>
                <li>Профессиональные фото: {summary.pro_photos}</li>
                <li>Снижения цены: {summary.price_reductions}</li>
                <li>Сумма снижений (₽): {summary.sum_price_reduction.toLocaleString()}</li>
              </>
            )}

            {activeTab === 'buyer' && (
              <>
                <li>Звонки покупателям: {summary.calls_buyers}</li>
                <li>Входящие звонки: {summary.incoming_calls}</li>
                <li>Статусы: {summary.statuses}</li>
                <li>Расклейка: {summary.stickers}</li>
                <li>Встречи с покупателями: {summary.meetings_buyers}</li>
                <li>Договоры с покупателями: {summary.contracts_buyers}</li>
                <li>Показы покупателям: {summary.showings_buyers}</li>
              </>
            )}
          </ul>

          <div className="mt-6">
            <h4 className="font-semibold mb-2">Воронка продаж</h4>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2">
              {activeTab === 'seller' && (
                <>
                  <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded flex-1 text-center">Звонки {summary.calls_sellers}</div>
                  <div className="text-gray-500 hidden md:block">→</div>
                  <div className="bg-green-100 text-green-800 px-3 py-2 rounded flex-1 text-center">Встречи {summary.meetings_sellers}</div>
                  <div className="text-gray-500 hidden md:block">→</div>
                  <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded flex-1 text-center">Договор {summary.contracts_sellers}</div>
                  <div className="text-gray-500 hidden md:block">→</div>
                  <div className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded flex-1 text-center">Снижения {summary.price_reductions}</div>
                  <div className="text-gray-500 hidden md:block">→</div>
                  <div className="bg-red-100 text-red-800 px-3 py-2 rounded flex-1 text-center">Показы {summary.showings_sellers}</div>
                </>
              )}

              {activeTab === 'buyer' && (
                <>
                  <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded flex-1 text-center">Звонки {summary.calls_buyers}</div>
                  <div className="text-gray-500 hidden md:block">→</div>
                  <div className="bg-green-100 text-green-800 px-3 py-2 rounded flex-1 text-center">Встречи {summary.meetings_buyers}</div>
                  <div className="text-gray-500 hidden md:block">→</div>
                  <div className="bg-purple-200 text-purple-800 px-3 py-2 rounded flex-1 text-center">Договор {summary.contracts_buyers}</div>
                  <div className="text-gray-500 hidden md:block">→</div>
                  <div className="bg-red-100 text-red-800 px-3 py-2 rounded flex-1 text-center">Показы {summary.showings_buyers}</div>
                </>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    )
  }

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
          <option value="day">День</option>
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
