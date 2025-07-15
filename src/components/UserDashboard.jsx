'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import ActivityChart from '@/components/ActivityChart'
import { supabase } from '@/lib/supabaseClient'
import { useModal } from '@/components/ModalContext'
import EditProfileModal from '@/components/EditProfileModal'
import ReportFormModal from '@/components/ReportFormModal'
import UserSidebar from '@/components/UserSidebar'
import AchievementBadge from '@/components/AchievementBadge'


import { AnimatePresence, motion } from 'framer-motion'

export default function UserDashboard({ user, isAdmin = false, profile: initialProfile }) {
  const [profile, setProfile] = useState(initialProfile)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [avatarLetter, setAvatarLetter] = useState('')
  const [activeTab, setActiveTab] = useState('seller')
  const todayISO = new Date().toISOString().split('T')[0]
  const [fromDate, setFromDate] = useState(todayISO)
  const [toDate, setToDate] = useState(todayISO)
  const [reports, setReports] = useState([])
  const { isModalOpen, closeModal } = useModal()

  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const showSettings = searchParams.has('settings')

  const closeSettings = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('settings')
    const basePath = window.location.pathname
    const newPath = params.toString() ? `${basePath}?${params.toString()}` : basePath
    router.push(newPath)
  }

  useEffect(() => {
    if (!user) return
    setAvatarLetter(user.email?.[0]?.toUpperCase() || '?')
  }, [user])

  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('email, first_name, last_name, avatar_url, phone, role')
        .eq('id', user.id)
        .single()

      if (!error && profileData) {
        setProfile(profileData)
      }
    }

    fetchProfile()
  }, [user?.id])

  useEffect(() => {
    if (!user || !fromDate || !toDate) return

    const loadSummaryAndReports = async () => {
      setLoading(true)

      const { data: allReports, error } = await supabase
        .from('reports')
        .select('*')
        .gte('date', fromDate)
        .lte('date', toDate)
        .eq('user_id', user.id)

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      const filteredReports = []

      const reportsByDate = allReports.reduce((acc, report) => {
        if (!acc[report.date]) acc[report.date] = []
        acc[report.date].push(report)
        return acc
      }, {})

      for (const date in reportsByDate) {
        const dateReports = reportsByDate[date]
        const ready = dateReports.find(r => r.status === 'ready')
        if (ready) {
          filteredReports.push(ready)
        } else {
          const set = dateReports.find(r => r.status === 'set')
          if (set) filteredReports.push(set)
        }
      }

      console.log('📋 Отчёты по дням:', filteredReports)

      const total = {
        calls_sellers: 0,
        calls_buyers: 0,
        stickers: 0,
        meetings_sellers: 0,
        meetings_buyers: 0,
        contracts_sellers: 0,
        contracts_buyers: 0,
        sum_price_reduction: 0,
        showings_sellers: 0,
        showings_buyers: 0,
        banners: 0,
        v: 0,
        objects_uploaded: 0,
        pro_photos: 0,
        price_reductions: 0,
        incoming_calls: 0,
        statuses: 0,
      }

      for (const report of filteredReports) {
        for (const key in total) {
          total[key] += report[key] || 0
        }
      }

      setSummary(total)
      setReports(filteredReports)
      setLoading(false)
    }

    loadSummaryAndReports()
  }, [user, fromDate, toDate])

  useEffect(() => {
    if (showSettings && !isAdmin) {
      router.push('/')
    }
  }, [showSettings, isAdmin, router])

  const getRoleLabel = (role) => {
    switch (role) {
      case 'trainee': return 'Стажёр'
      case 'agent': return 'Агент'
      case 'admin': return 'Администратор'
      default: return 'Неизвестная роль'
    }
  }

  return (
    <main className="max-w-4xl mx-auto mt-0 p-4 bg-white rounded shadow relative">
      {user ? (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="hidden relstive md:block md:w-[30%]">
            <UserSidebar user={user} profile={profile} isAdmin={isAdmin} />
          </div>

          <div className="w-full md:w-full">
            {/* Вкладки */}
            <div className="flex mb-4 border-b">
              <button
                onClick={() => setActiveTab('seller')}
                className={`px-4 py-2 text-[24px] font-semibold ${activeTab === 'seller' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}
              >
                Продавец
              </button>
              <button
                onClick={() => setActiveTab('buyer')}
                className={`px-4 py-2 text-[24px] font-semibold ${activeTab === 'buyer' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}
              >
                Покупатель
              </button>
            </div>

            {/* Выбор диапазона */}
            <div className="flex justify-end items-center mb-4">
              
              <div className="flex gap-4 mb-4">
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="border p-2 rounded"
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="border p-2 rounded"
                />
              </div>
            </div>

            {loading && <p>Загрузка...</p>}

            {!loading && summary && (
              <>
                {/* График */}
                <div className="my-1">
                  <AchievementBadge reports={reports} />
                  <ActivityChart reports={reports} fromDate={fromDate} toDate={toDate} activeTab={activeTab} />
                </div>

                {/* Данные по вкладке */}
                <ul className="grid grid-cols-2 gap-2 mt-5 text-sm">
                  {activeTab === 'seller' && (
                    <>
                      <li>Звонки продавцам: {summary.calls_sellers}</li>
                      <li>Встречи с продавцами: {summary.meetings_sellers}</li>
                      <li>Договоры с продавцами: {summary.contracts_sellers}</li>
                      <li>Показы продавцам: {summary.showings_sellers}</li>
                      <li>Банеры: {summary.banners}</li>
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

                {/* Воронка продаж */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Воронка продаж</h4>
                  <div className="flex flex-row text-[10px] md:flex-row md:text-[16px] items-center space-y-0 md:space-y-0 md:space-x-2">
                    {activeTab === 'seller' && (
                      <>
                        <div className="bg-blue-100 mx-2 text-blue-800 px-3 py-2 rounded flex-1 text-center">Звонки <br></br> {summary.calls_sellers}</div>
                        <div className="text-gray-500 mx-2 hidden md:block">→</div>
                        <div className="bg-green-100 mx-2 text-green-800 px-3 py-2 rounded flex-1 text-center">Встречи <br></br> {summary.meetings_sellers}</div>
                        <div className="text-gray-500 mx-2 hidden md:block">→</div>
                        <div className="bg-purple-100 mx-2 text-purple-800 px-3 py-2 rounded flex-1 text-center">Договор <br></br> {summary.contracts_sellers}</div>
                        <div className="text-gray-500 mx-2 hidden md:block">→</div>
                        <div className="bg-yellow-100 mx-2 text-yellow-800 px-3 py-2 rounded flex-1 text-center">Снижения <br></br> {summary.price_reductions}</div>
                        <div className="text-gray-500 mx-2 hidden md:block">→</div>
                        <div className="bg-red-100 mx-2 text-red-800 px-3 py-2 rounded flex-1 text-center">Показы <br></br> {summary.showings_sellers}</div>
                      </>
                    )}

                    {activeTab === 'buyer' && (
                      <>
                        <div className="bg-blue-100 mx-2 text-blue-800 px-3 py-2 rounded flex-1 text-center">Звонки {summary.calls_buyers}</div>
                        <div className="text-gray-500 mx-2 hidden md:block">→</div>
                        <div className="bg-green-100 mx-2 text-green-800 px-3 py-2 rounded flex-1 text-center">Встречи {summary.meetings_buyers}</div>
                        <div className="text-gray-500 mx-2 hidden md:block">→</div>
                        <div className="bg-purple-200 mx-2 text-purple-800 px-3 py-2 rounded flex-1 text-center">Договор {summary.contracts_buyers}</div>
                        <div className="text-gray-500 mx-2 hidden md:block">→</div>
                        <div className="bg-red-100 mx-2 text-red-800 px-3 py-2 rounded flex-1 text-center">Показы {summary.showings_buyers}</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Кнопка заполнить отчет */}
                <button
  onClick={() => setIsReportModalOpen(true)}
  className="mt-6 inline-block bg-[#e53740] text-white px-4 py-2 rounded hover:bg-[#f19196]"
>
  Отчеты
</button>
{isReportModalOpen && (
  <ReportFormModal user={user} isAdmin={isAdmin} profile={profile} onClose={() => setIsReportModalOpen(false)} />
)}

              </>
            )}
            {isModalOpen && (
              <EditProfileModal userId={user.id} />
            )}
          </div>
        </div>
      ) : (
        <p>Загрузка пользователя...</p>
      )}
    </main>
    
  )
}

