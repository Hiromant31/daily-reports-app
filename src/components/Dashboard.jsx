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
  const [profile, setProfile] = useState(null)
  const [summary, setSummary] = useState(null)
  const [range, setRange] = useState('yesterd')
  const [loading, setLoading] = useState(false)
  const [avatarLetter, setAvatarLetter] = useState('')
  const [fromISO, setFromISO] = useState('')
  const [activeTab, setActiveTab] = useState('seller')

  // Получаем пользователя
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setAvatarLetter(user.email?.[0]?.toUpperCase() || '?')
      }
      const { data: profileData, error } = await supabase
          .from('profiles')
          .select('email, first_name, last_name, avatar_url, phone, role')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Ошибка загрузки профиля:', error)
        } else {
          setProfile(profileData)
        }
    }
    fetchUser()
  }, [])


  const getRoleLabel = (role) => {
  switch (role) {
    case 'trainee': return 'Стажёр'
    case 'agent': return 'Агент'
    case 'admin': return 'Администратор'
    default: return 'Неизвестная роль'
  }
}

  // Получаем сводку по выбранному диапазону
  useEffect(() => {
    if (!user) return

    const loadSummary = async () => {
      setLoading(true)
      const today = new Date()
      let fromDate = new Date()

      switch (range) {
        case 'week': fromDate.setDate(today.getDate() - 7); break
        case 'yesterd': fromDate.setDate(today.getDate() - 1); break;
        case 'today': fromDate = new Date(); break
        case 'month': fromDate.setMonth(today.getMonth() - 1); break
        case 'halfyear': fromDate.setMonth(today.getMonth() - 6); break
        case 'year': fromDate.setFullYear(today.getFullYear() - 1); break
      }

      const iso = fromDate.toISOString().split('T')[0]
      setFromISO(iso) // сохраняем в состояние

      
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .gte('date', iso)
        .eq('user_id', user.id)

        console.log('iso:', iso)
        console.log('reports:', data)

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
          <div className="flex flex-col md:flex-row gap-6">
            {/* Левая часть — профиль */}
            <div className="w-full md:w-1/3">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-indigo-200 flex items-center justify-center text-2xl font-bold text-indigo-700">
                  {avatarLetter}
                </div>
                <h2 className="text-lg font-semibold mt-2 text-center">{user.email}</h2>
                {/* Информация о профиле */}
<div className="mt-8 p-4 border-t border-gray-200 text-sm text-gray-600">
  <h4 className="font-semibold mb-2">Информация о профиле</h4>
  {profile ? (
    <ul>
      <li><strong>Email:</strong> {profile.email}</li>
      <li><strong>Имя:</strong> {profile.first_name || 'Не указано'}</li>
      <li><strong>Фамилия:</strong> {profile.last_name || 'Не указана'}</li>
      <li><strong>Телефон:</strong> {profile.phone || 'Не указан'}</li>
      <li><strong>Роль:</strong> {getRoleLabel(profile.role)}</li>
    </ul>
  ) : (
    <p>Профиль не найден</p>
  )}
</div>
              </div>
            </div>

            {/* Правая часть — сводка */}
            <div className="w-full md:w-2/3">
              {/* Вкладки */}
              <div className="flex mb-4 border-b">
                <button
                  onClick={() => setActiveTab('seller')}
                  className={`px-4 py-2 font-medium ${activeTab === 'seller' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                >
                  Продавец
                </button>
                <button
                  onClick={() => setActiveTab('buyer')}
                  className={`px-4 py-2 font-medium ${activeTab === 'buyer' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                >
                  Покупатель
                </button>
              </div>

              {/* Выбор диапазона */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Сводка по отчетам</h3>
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="border px-2 py-1 rounded"
                >
                  <option value="yesterd">Вчера</option>
                  <option value="today">Сегодня</option>
                  <option value="week">Неделя</option>
                  <option value="month">Месяц</option>
                  <option value="halfyear">Полгода</option>
                  <option value="year">Год</option>
                </select>
              </div>

              {loading && <p>Загрузка...</p>}

              {!loading && summary && (
                <>
                  {/* График */}
                  <div className="mb-6 p-4 bg-gray-50 rounded shadow-sm">
                    <h4 className="font-semibold mb-2">График активности</h4>
                    <div className="h-24 bg-white border rounded flex items-end space-x-2 p-2 text-xs text-center">
                      {/* Пример данных за неделю */}
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className="flex-1 bg-indigo-200 rounded-t h-8"></div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Пн</span>
                      <span>Вт</span>
                      <span>Ср</span>
                      <span>Чт</span>
                      <span>Пт</span>
                      <span>Сб</span>
                      <span>Вс</span>
                    </div>
                  </div>

                  {/* Данные по вкладке */}
                  <ul className="grid grid-cols-2 gap-2 text-sm">
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

                  {/* Кнопка заполнить отчет */}
                  <Link
                    href="/report"
                    className="mt-6 inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  >
                    Заполнить отчет
                  </Link>
                </>
              )}
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
              <li><strong>Дата</strong>{fromISO} </li>
              </ul>
              ) : (
              <p>Пользователь не авторизован</p>
              )}
          </div>
        </main>
    </div>
  )
}

