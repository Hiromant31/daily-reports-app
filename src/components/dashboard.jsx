'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useSession } from '@supabase/auth-helpers-react';

const MyComponent = () => {
  const session = useSession();
  const user = session?.user;

  console.log('User:', user);
};

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [summary, setSummary] = useState(null)
  const [range, setRange] = useState('week')
  const [loading, setLoading] = useState(false)
  const [avatarLetter, setAvatarLetter] = useState('')

  // Получаем пользователя
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setAvatarLetter(user.email?.[0]?.toUpperCase() || '?')
      }
    }
    fetchUser()
  }, [])

  // Получаем сводку по выбранному диапазону
  useEffect(() => {
    if (!user) return

    const loadSummary = async () => {
      setLoading(true)
      const today = new Date()
      let fromDate = new Date()

      switch (range) {
        case 'week': fromDate.setDate(today.getDate() - 7); break
        case 'month': fromDate.setMonth(today.getMonth() - 1); break
        case 'halfyear': fromDate.setMonth(today.getMonth() - 6); break
        case 'year': fromDate.setFullYear(today.getFullYear() - 1); break
      }

      const fromISO = fromDate.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .gte('date', fromISO)
        .eq('user_id', user.id)

      if (error) {
        console.error(error)
      } else {
        const total = {
          calls_sellers: 0,
          calls_buyers: 0,
          stickers: 0,
          meetings_sellers: 0,
          meetings_buyers: 0,
          contracts_sellers: 0,
          contracts_buyers: 0,
          sum_price_reduction: 0,
        }

        for (const report of data) {
          for (const key in total) {
            total[key] += report[key] || 0
          }
        }

        setSummary(total)
      }

      setLoading(false)
    }

    loadSummary()
  }, [user, range])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    location.reload()
  }

  return (
    
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Шапка */}
      <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Название Компании</h1>
        <button
          className="text-sm text-red-600 hover:underline"
          onClick={handleLogout}
        >
          Выйти
        </button>
      </header>

      {/* Основная часть */}
      <main className="max-w-4xl mx-auto mt-8 p-4 bg-white rounded shadow">
        {user ? (
          <div className="flex gap-6">
            {/* Левая часть — профиль */}
            <div className="w-1/3">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-indigo-200 flex items-center justify-center text-2xl font-bold text-indigo-700">
                  {avatarLetter}
                </div>
                <h2 className="text-lg font-semibold mt-2 text-center">{user.email}</h2>
              </div>
            </div>

            {/* Правая часть — сводка */}
            <div className="w-2/3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Сводка по отчетам</h3>
                <select
                  value={range}
                  onChange={e => setRange(e.target.value)}
                  className="border px-2 py-1 rounded"
                >
                  <option value="week">Неделя</option>
                  <option value="month">Месяц</option>
                  <option value="halfyear">Полгода</option>
                  <option value="year">Год</option>
                </select>
              </div>

              {loading && <p>Загрузка...</p>}

              {!loading && summary && (
                <ul className="grid grid-cols-2 gap-2 text-sm">
                  <li>Звонки продавцам: {summary.calls_sellers}</li>
                  <li>Звонки покупателям: {summary.calls_buyers}</li>
                  <li>Встречи с продавцами: {summary.meetings_sellers}</li>
                  <li>Встречи с покупателями: {summary.meetings_buyers}</li>
                  <li>Договоры с продавцами: {summary.contracts_sellers}</li>
                  <li>Договоры с покупателями: {summary.contracts_buyers}</li>
                  <li>Расклейка: {summary.stickers}</li>
                  <li>Снижение цен (₽): {summary.sum_price_reduction.toLocaleString()}</li>
                </ul>
              )}

              <Link
                href="/report"
                className="mt-6 inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Заполнить отчет
              </Link>
            </div>
          </div>
        ) : (
          <p>Загрузка пользователя...</p>
        )}
        {/* Информация о пользователе */}
<div className="mt-8 p-4 border-t border-gray-200 text-sm text-gray-600">
  <h4 className="font-semibold mb-2">Информация о пользователе</h4>
  {user ? (
    <ul>
      <li><strong>ID:</strong> {user.id}</li>
      <li><strong>Email:</strong> {user.email}</li>
      <li><strong>Дата регистрации:</strong> {new Date(user.created_at).toLocaleDateString()}</li>
    </ul>
  ) : (
    <p>Пользователь не авторизован</p>
  )}
</div>
      </main>
    </div>
  )
}
