'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useSession } from '@supabase/auth-helpers-react'
import ActivityChart from '@/components/ActivityChart'
import EditProfileForm from '@/components/EditProfileForm'


const MyComponent = () => {
  const session = useSession()
  const user = session?.user
  console.log('User:', user)
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [summary, setSummary] = useState(null)
  const [range, setRange] = useState('yesterd')
  const [loading, setLoading] = useState(false)
  const [avatarLetter, setAvatarLetter] = useState('')
  const [fromISO, setFromISO] = useState('')
  const [activeTab, setActiveTab] = useState('seller')
  const todayISO = new Date().toISOString().split('T')[0]
  const [fromDate, setFromDate] = useState(todayISO)
  const [toDate, setToDate] = useState(todayISO)
  const [reports, setReports] = useState([]) // сюда загрузить сырые отчёты для графика


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
  if (!user || !fromDate || !toDate) return

  const loadSummaryAndReports = async () => {
    setLoading(true)

    const { data, error } = await supabase
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

    // Считаем итоги по summary
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
      banners: 0,
      v: 0,
      objects_uploaded: 0,
    }

    for (const report of data) {
      for (const key in total) {
        total[key] += report[key] || 0
      }
    }

    setSummary(total)
    setReports(data) // если у тебя есть состояние reports для графика

    setLoading(false)
  }

  loadSummaryAndReports()
}, [user, fromDate, toDate])


  const handleLogout = async () => {
    await supabase.auth.signOut()
    location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Шапка */}
      <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <div className="flex mx-auto justify-left">
        <svg className="mx-auto sm:mx-0" width="112" height="28" viewBox="0 0 112 28" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-dc18dd99=""><path d="M61.3805 0.344828C61.1068 0.344828 60.885 0.560968 60.885 0.827586V27.1034C60.885 27.3701 61.1068 27.5862 61.3805 27.5862H68.885C69.1587 27.5862 69.3805 27.3701 69.3805 27.1034V20.0642C69.3805 19.6043 69.9782 19.4049 70.2676 19.7682L76.198 27.2126C76.3857 27.4483 76.6748 27.5862 76.981 27.5862H85.466C85.8782 27.5862 86.1102 27.1247 85.8575 26.8075L75.661 14.0078C75.6412 13.9829 75.6412 13.9481 75.661 13.9232L85.8575 1.12355C86.1102 0.806371 85.8782 0.344828 85.466 0.344828H76.981C76.6748 0.344828 76.3857 0.482725 76.198 0.718413L70.2676 8.1628C69.9782 8.52615 69.3805 8.32676 69.3805 7.86683V0.827586C69.3805 0.560968 69.1587 0.344828 68.885 0.344828H61.3805Z" fill="#e53740" data-v-dc18dd99=""></path><path fill-rule="evenodd" clip-rule="evenodd" d="M13.3097 0C17.479 0 18.9202 1.62779 20.177 3.18785V0.827586C20.177 0.560968 20.3989 0.344828 20.6726 0.344828H27.3982C27.6719 0.344828 27.8938 0.560968 27.8938 0.827586V27.1034C27.8938 27.3701 27.6719 27.5862 27.3982 27.5862H20.6726C20.3989 27.5862 20.177 27.3701 20.177 27.1034V24.7367C18.9618 26.1893 17.3979 27.931 13.3097 27.931C11.0536 27.931 8.59493 27.5702 6.44248 26.4138C2.81995 24.4675 0 20.5107 0 14C0 7.78208 2.46803 3.99251 5.55752 2C8.08779 0.368147 11.0466 0 13.3097 0ZM10.1947 9.44828C9.72549 9.44828 9.34513 9.8188 9.34513 10.2759V17.6552C9.34513 18.1122 9.72549 18.4828 10.1947 18.4828H16.5337C16.8639 18.4828 17.1724 18.3226 17.3565 18.0556L19.9648 14.2732C20.0931 14.0871 20.0931 13.8439 19.9648 13.6579L17.3565 9.8754C17.1724 9.60841 16.8639 9.44828 16.5337 9.44828H10.1947Z" fill="#e53740" data-v-dc18dd99=""></path><path d="M111.979 10.151C111.359 7.59508 108.656 -5.08339e-06 98.4087 0C94.8753 1.75287e-06 92.2721 0.881814 90.3017 2.10604C82.4177 7.00439 82.431 21.0039 90.3017 25.894C92.2721 27.1182 94.8753 28 98.4087 28C108.656 28 111.359 20.4049 111.979 17.849C112.089 17.396 111.753 16.9826 111.278 16.9358L103.877 16.2065C103.669 16.186 103.467 16.2787 103.35 16.4478L102.241 18.0556C102.057 18.3226 101.749 18.4828 101.419 18.4828H94.5841C94.1149 18.4828 93.7345 18.1122 93.7345 17.6552V10.2759C93.7345 9.8188 94.1149 9.44828 94.5841 9.44828H101.419C101.749 9.44828 102.057 9.60842 102.241 9.8754L103.395 11.5478C103.511 11.7169 103.714 11.8096 103.922 11.7891L111.278 11.0642C111.753 11.0174 112.089 10.604 111.979 10.151Z" fill="#e53740" data-v-dc18dd99=""></path><path fill-rule="evenodd" clip-rule="evenodd" d="M32.9204 4.65517C34.4908 2.06112 37.461 0.344828 41.1327 0.344828H55.7168C55.9905 0.344828 56.2124 0.560968 56.2124 0.827586V27.1034C56.2124 27.3701 55.9905 27.5862 55.7168 27.5862H48.9911C48.7174 27.5862 48.4956 27.3701 48.4956 27.1034V21.5172H46.1809L41.6427 27.2127C41.455 27.4483 41.166 27.5862 40.8598 27.5862H32.3748C31.9627 27.5862 31.7306 27.1246 31.9834 26.8074L36.8831 20.6582C35.325 19.9666 34.0437 18.8956 33.1521 17.5862C31.8793 15.7169 31.3628 13.3618 31.3628 10.931C31.3628 8.6908 31.8363 6.44582 32.9204 4.65517ZM41.5575 7.93103C41.0883 7.93103 40.708 8.30155 40.708 8.75862V13.1034C40.708 13.5605 41.0883 13.931 41.5575 13.931H47.5752C48.0444 13.931 48.4248 13.5605 48.4248 13.1034V8.75862C48.4248 8.30155 48.0444 7.93103 47.5752 7.93103H41.5575Z" fill="#e53740" data-v-dc18dd99=""></path></svg>
      </div>
        <div className="flex items-center gap-4">
          {profile?.role === 'admin' && (
            <a
              href="/admin"
              className="text-sm text-indigo-600 hover:underline border border-indigo-600 rounded px-3 py-1 mr-2"
            >
              Админ
            </a>
          )}
          <button
            className="text-sm text-red-600 hover:underline"
            onClick={handleLogout}
          >
            Выйти
          </button>
        </div>
      </header>

      {/* Основная часть */}
      <main className="max-w-4xl mx-auto mt-8 p-4 bg-white rounded shadow">
        {user ? (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Левая часть — профиль */}
            <div className="w-full md:w-1/3">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-[#fbe1e2] flex items-center justify-center text-2xl font-bold text-[#e53740]">
                  {avatarLetter}
                </div>
                <h2 className="text-lg text-gray-600 font-semibold mt-2 text-center">
                  {profile?.first_name || ''} {profile?.last_name || ''}
                </h2>

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
                  className={`px-4 py-2 font-medium ${activeTab === 'seller' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}
                >
                  Продавец
                </button>
                <button
                  onClick={() => setActiveTab('buyer')}
                  className={`px-4 py-2 font-medium ${activeTab === 'buyer' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500'}`}
                >
                  Покупатель
                </button>
              </div>

              {/* Выбор диапазона */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Сводка по отчетам</h3>
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
                  
                    <div className="my-10">
                      <ActivityChart reports={reports} fromDate={fromDate} toDate={toDate} activeTab={activeTab} /></div>
                  
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
                    className="mt-6 inline-block bg-[#e53740] text-white px-4 py-2 rounded hover:bg-[#f19196]"
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
              <li><strong>Дата</strong>{fromISO}</li>
            </ul>
          ) : (
            <p>Пользователь не авторизован</p>
          )}
        </div>
      </main>
    </div>
  )
}