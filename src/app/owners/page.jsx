'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import ObjectDetails from './ObjectDetails'
import AddPropertyModal from './AddPropertyModal'
import PropertyList from './PropertiesList'  // <-- вынесенный компонент списка
import { AnimatePresence, motion } from 'framer-motion'

export default function OwnersPage() {
  const [user, setUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showMenuMobile, setShowMenuMobile] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [properties, setProperties] = useState([])
  const [selectedProperty, setSelectedProperty] = useState(null)

  const router = useRouter()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Получаем юзера и его объекты
  useEffect(() => {
    const fetchUserAndProperties = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: propertiesData, error } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', user.id)
          .order('next_call_date', { ascending: true })

        if (!error && propertiesData) {
          // Подгружаем владельцев для каждого объекта
          const propertiesWithOwners = await Promise.all(
            propertiesData.map(async (property) => {
              const { data: ownersData, error: ownersError } = await supabase
                .from('property_owners')
                .select('owners(*)')
                .eq('property_id', property.id)

              return {
                ...property,
                owners: ownersError ? [] : ownersData.map((po) => po.owners),
              }
            })
          )
          setProperties(propertiesWithOwners)
          setSelectedProperty(propertiesWithOwners[0] || null)
        }
      }
    }
    fetchUserAndProperties()
  }, [])

  const reloadProperties = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', user.id)
      .order('next_call_date', { ascending: true })
    if (!error && data) setProperties(data)
    setSelectedProperty((prev) => data.find((p) => p.id === prev?.id) || data[0] || null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex relative h-full bg-[#FAF4E4] w-screen justify-center m-auto">
      <div className="md:grid md:grid-cols-12 flex relative w-full md:max-w-[1400px] h-full m-auto">
        {/* Пустой див для разметки */}
        <div></div>

        {/* Кнопка меню (моб) */}
        {isMobile && (
          <button
            className="fixed top-4 right-4 z-50 bg-[#131313] text-white px-3 py-2 rounded"
            onClick={() => setShowMenuMobile(true)}
          >
            ☰ Меню
          </button>
        )}

        {/* Сайдбар (десктоп) */}
        <div className="md:col-span-2 h-screen py-6">
          <div className="hidden h-full md:flex bg-[#131313] p-[24px] mb-[50px] rounded-[25px] flex-col">
            <span className="font-daysone text-white text-center text-[32px]">АЯКС</span>
            <nav className="flex text-[18px] text-white justify-start font-comfortaa font-bold mt-[20px] flex-col gap-3">
              <button
                onClick={() => router.push('/')}
                className="text-start flex flex-row"
              >
                <svg
                  className="pr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m8 9l5 5v7H8v-4m0 4H3v-7l5-5m1 1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17h-8m0-14v.01M17 7v.01M17 11v.01M17 15v.01"
                  />
                </svg>
                Главная
              </button>
              <button onClick={() => router.push('/owners')} className="text-start text-[#F5B8DA]">
                Мои объекты
              </button>
              <button onClick={() => router.push('/reports')} className="text-start">
                Отчёты
              </button>
              <button onClick={() => router.push('/profile')} className="text-start">
                Профиль
              </button>
              <button onClick={handleLogout} className="mt-4 text-start text-[#F5B8DA]">
                Выйти
              </button>
            </nav>
          </div>
        </div>

        {/* Список объектов */}
        <div className="relative md:col-span-3 w-full h-screen py-6">
          <div className="flex-row w-full h-full pl-5 overflow-auto">
            <button
              onClick={() => setShowModal(true)}
              className="font-daysone px-3 py-1 mx-2 my-2 rounded bg-[#FAE2E2] hover:bg-[#E2EAFA]"
            >
              + Добавить
            </button>

            {/* Вот здесь теперь используем вынесенный PropertyList */}
            <PropertyList
              properties={properties}
              selected={selectedProperty}
              onSelect={(p) => {
                setSelectedProperty(p)
                if (isMobile) setDetailsOpen(true)
              }}
            />
          </div>
        </div>

        {/* Подробности объекта */}
        <div className="flex hidden md:flex md:col-span-5 h-screen p-6">
          <div className="h-full w-full">
            {!isMobile && (
              <div className="flex w-full h-full bg-[#FAE2E2] shadow rounded-lg mb-10 overflow-y-auto">
                {selectedProperty ? (
                  <ObjectDetails
                    property={selectedProperty}
                    onUpdated={(updater) => {
                      setSelectedProperty((prev) =>
                        typeof updater === 'function' ? updater(prev) : updater
                      )
                      setProperties((prev) =>
                        prev.map((p) =>
                          p.id === selectedProperty.id
                            ? typeof updater === 'function'
                              ? updater(p)
                              : updater
                            : p
                        )
                      )
                    }}
                  />
                ) : (
                  <p className="text-gray-500">Выберите объект слева</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно деталей (моб) */}
      <AnimatePresence>
        {isMobile && detailsOpen && selectedProperty && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-10 left-0 right-0 z-50 bg-[#FAE2E2] rounded-t-2xl m-4 max-h-[90vh] overflow-y-auto"
          >
            <button
              className="text-gray-500 float-right"
              onClick={() => setDetailsOpen(false)}
            >
              ✕ Закрыть
            </button>
            <ObjectDetails
              property={selectedProperty}
              onUpdated={(updater) => {
                setSelectedProperty((prev) =>
                  typeof updater === 'function' ? updater(prev) : updater
                )
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Меню (моб) */}
      <AnimatePresence>
        {isMobile && showMenuMobile && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 40, stiffness: 500 }}
            className="fixed top-0 backdrop-blur-md right-0 w-[200px] h-full bg-[#131313] text-white p-6 z-50 shadow-xl"
          >
            <button className="text-right mb-4" onClick={() => setShowMenuMobile(false)}>
              ✕
            </button>
            <nav className="flex flex-col gap-3 text-[18px] font-comfortaa font-bold">
              <span className="font-daysone text-white text-center text-[32px]">АЯКС</span>
              <button onClick={() => router.push('/')}>Главная</button>
              <button onClick={() => router.push('/owners')}>Мои объекты</button>
              <button onClick={() => router.push('/reports')}>Отчёты</button>
              <button onClick={() => router.push('/profile')}>Профиль</button>
              <button onClick={handleLogout} className="mt-4 text-[#F5B8DA]">
                Выйти
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модалка добавления */}
      {showModal && (
        <div className="overflow-y-auto">
          <AddPropertyModal
            user={user}
            onClose={() => setShowModal(false)}
            onCreated={() => {
              reloadProperties()
              setShowModal(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
