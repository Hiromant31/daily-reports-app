'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const ADMIN_EMAIL = 'test4@gmail.com' // поменяй на нужный

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState([])
  const [range, setRange] = useState('week')

  useEffect(() => {
    const fetchUserAndReports = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      if (user.email !== ADMIN_EMAIL) {
        router.push('/') // обычным юзерам доступ запрещён
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
      case 'week':
        fromDate.setDate(today.getDate() - 7)
        break
      case 'month':
        fromDate.setMonth(today.getMonth() - 1)
        break
      case 'year':
        fromDate.setFullYear(today.getFullYear() - 1)
        break
      default:
        fromDate = new Date(0)
    }

    const fromISO = fromDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        profile: user_id (
        email,
        first_name,
        last_name,
        role,
        avatar_url
        )
      `)
      .gte('date', fromISO)
      .order('date', { ascending: false })

    if (error) {
      alert('Ошибка загрузки отчетов', error.message)
      console.error(error)
    } else {
      setReports(data)
    }
    setLoading(false)
  }

  const onRangeChange = async (e) => {
    const val = e.target.value
    setRange(val)
    await loadReports(val)
  }

  if (loading) return <div className="p-4">Загрузка...</div>

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Админка — Отчёты сотрудников</h1>
        {/* Кнопка выхода, фильтры и т.п. */}
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <h2 className="text-xl font-semibold mb-2">{report.profile?.first_name ?? 'Пользователь'}</h2>
            <p className="text-gray-300 text-sm mb-4">{report.profile?.email ?? 'Email отсутствует'}</p>
            
            <ul className="space-y-1 text-gray-200 text-sm">
              <li>Звонки покупателям: <span className="font-medium">{report.calls_buyers}</span></li>
              <li>Звонки продавцам: <span className="font-medium">{report.calls_sellers}</span></li>
              <li>Договоры покупателя: <span className="font-medium">{report.contracts_buyers}</span></li>
              <li>Договоры продавца: <span className="font-medium">{report.contracts_sellers}</span></li>
              {/* Добавь другие параметры по аналогии */}
            </ul>

            <p className="mt-4 text-xs text-gray-400">Дата отчёта: {new Date(report.date).toLocaleDateString()}</p>
          </div>
        ))}
      </main>
    </motion.div>
  )
}
