'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useModal } from '@/components/ModalContext'; // Импортируем компонент редактирования профиля

export default function UserSidebar({ user, profile, isAdmin }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false) // Состояние для открытия модалки редактирования
  const router = useRouter()
  const { openModal } = useModal();
  const searchParams = useSearchParams()

  const avatarLetter = profile?.first_name?.[0]?.toUpperCase() || '?' // Без useEffect для упрощения

  const getRoleLabel = (role) => {
    switch (role) {
      case 'trainee': return 'Стажёр'
      case 'agent': return 'Агент'
      case 'admin': return 'Администратор'
      default: return 'Неизвестная роль'
    }
  }

  const closeEditProfile = () => setIsEditProfileOpen(false) // Функция для закрытия модалки

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Мобильная кнопка для меню */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 bg-white w-full">
  {/* Имя слева */}
  <p className="w-full text-2xl relative mr-30 font-bold text-[#e53740]">{profile?.first_name} {profile?.last_name}</p>

  {/* Кнопка ☰ справа */}
  <button onClick={() => setMenuOpen(true)} className="text-4xl font-bold text-red-600">
    ☰
  </button>
</div>



      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Блюрный фон — не двигается, просто появляется */}
            <motion.div
              className="fixed inset-0 z-40 bg-opacity-40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Выезжающая справа панель */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 right-0 z-50 rounded-[20px] w-[70%] min-w-64 max-w-96 h-[70%] mr-5 bg-white shadow-lg p-4 md:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Профиль</h2>
                <button onClick={() => setMenuOpen(false)} className="text-2xl">×</button>
              </div>

              <div className="mt-4 text-center">
                <div className="w-36 h-36 rounded-full bg-[#fbe1e2] flex items-center justify-center text-5xl font-bold text-[#e53740] mx-auto">
                  {avatarLetter}
                </div>
                <p className="mt-2 font-medium">{profile?.first_name} {profile?.last_name}</p>
                <p className="text-sm text-gray-500">{getRoleLabel(profile?.role)}</p>
              </div>

              <ul className="mt-6 text-sm space-y-2">
                <li><strong>Email:</strong> {profile?.email}</li>
                <li><strong>Телефон:</strong> {profile?.phone || 'Не указан'}</li>
              </ul>
              <button
            onClick={() => router.push('/owners')}
            className="mt-4 w-full text-left px-4 py-2 text-sm rounded bg-[#e53740] text-white hover:bg-[#c72f35]"
          >
            Мои объекты
          </button>

              {/* Добавляем проверку isAdmin для мобильной версии */}
              {isAdmin && (
                <>
                  {/* Кнопка "Редактировать профиль", открывающая модалку */}
                  <button
                    onClick={openModal} // Открываем модалку
                    className="mt-4 w-full text-left px-4 py-2 text-sm rounded bg-[#e53740] text-white hover:bg-[#c72f35]"
                  >
                    Редактировать профиль
                  </button>

                  <button
                    onClick={() => router.push('/admin')}
                    className="mt-4 w-full text-left px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Админ панель
                  </button>
                </>
              )}

              <button
                onClick={handleLogout}
                className="mt-4 w-full text-left px-4 py-2 text-sm rounded bg-[#e53740] text-white hover:bg-[#c72f35]"
              >
                Выйти
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Модалка редактирования профиля */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <div className="bg-white p-6 rounded shadow max-w-lg w-full relative">
              <button
                onClick={closeEditProfile} // Закрываем модалку
                className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
              >
                ×
              </button>
              <EditProfileForm userId={user?.id} /> {/* Рендерим форму редактирования профиля */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Стационарный блок для десктопа */}
      <div className="hidden md:block">
        <div className="flex flex-col items-center">
          <div className="w-36 h-36 rounded-full bg-[#fbe1e2] flex items-center justify-center text-5xl font-bold text-[#e53740]">
            {avatarLetter}
          </div>

          {/* Информация о профиле */}
          <div className="mt-8 p-4 border-t border-gray-200 text-sm text-gray-600 w-full">
            {profile ? (
              <ul>
                <li className=''><strong>Имя:</strong><br></br> <div className='text-[20px] text-red-700 font-semibold'> {profile.first_name || 'Не указано'}</div></li>
                <li><strong>Фамилия:</strong> <br></br> <div className='text-[20px] text-red-700 font-semibold'>{profile.last_name || 'Не указана'}</div></li>
                <li className='mt-5'><strong className='text-[18px]'>Email:</strong> <br></br> {profile.email}</li>
                <li className='mt-5'><strong>Телефон:</strong> {profile.phone || 'Не указан'}</li>
                <li className='mt-5'><strong>Роль:</strong> <br></br> <div className='text-[20px] text-red-700 font-semibold'> {getRoleLabel(profile.role)}</div></li>
              </ul>
              
              
            ) : (
              <p>Профиль не найден</p>
            )}
            
            {/* Добавляем проверку isAdmin для десктопной версии */}
            {(isAdmin || profile?.role === 'admin') && (
              <>
                {/* Кнопка "Редактировать профиль" */}
                <button
                  onClick={openModal} // Открываем модалку
                  className="mt-4 w-full text-left px-4 py-2 text-sm rounded bg-[#e53740] text-white hover:bg-[#c72f35]"
                >
                  Редактировать профиль
                </button>

                {/* Кнопка "Админ панель" */}
                <button
                  onClick={() => router.push('/admin')}
                  className="mt-4 w-full text-left px-4 py-2 text-sm rounded bg-[#3b82f6] text-white hover:bg-[#2563eb]"
                >
                  Админ панель
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
