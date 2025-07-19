'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import ObjectCard from './ObjectCard'
import ObjectDetails from './ObjectDetails'
import AddPropertyModal from './AddPropertyModal'
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

  useEffect(() => {
    const fetchUserAndProperties = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: propertiesData } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', user.id)
          .order('next_call_date', { ascending: true })

        const propertiesWithOwners = await Promise.all(
          (propertiesData || []).map(async (property) => {
            const { data: ownersData, error: ownersError } = await supabase
              .from('property_owners')
              .select('owners(*)')
              .eq('property_id', property.id)

            return {
              ...property,
              owners: ownersError ? [] : ownersData.map(po => po.owners),
            }
          })
        )

        setProperties(propertiesWithOwners)
        setSelectedProperty(propertiesWithOwners?.[0] || null)
      }
    }

    fetchUserAndProperties()
  }, [])

  const reloadProperties = async () => {
    if (!user) return
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', user.id)
      .order('next_call_date', { ascending: true })

    setProperties(data)
    setSelectedProperty(prev => data.find(p => p.id === prev?.id) || data[0] || null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex relative h-full bg-[#FAF4E4]  w-full justify-center m-auto p-[10px]">
        <div className=''>
      {/* Кнопка меню (моб) */}
      {isMobile && (
        <button
          className="fixed top-4 right-4 z-50 bg-[#131313] text-white px-3 py-2 rounded"
          onClick={() => setShowMenuMobile(true)}
        >
          ☰ Меню
        </button>
      )}

      <div className="flex relative w-full md:max-w-[1200px] h-full m-auto">
        {/* Сайдбар (только десктоп) */}
        <div className="hidden md:flex bg-[#131313] p-[24px] text-center max-w-[240px] w-2/5 mb-[50px] rounded-[25px] flex-col">
          <span className='font-daysone text-white text-[32px]'>АЯКС</span>
          <nav className="flex text-[18px] text-white font-comfortaa font-bold border-b mt-[20px] flex-col gap-3">
            <button onClick={() => router.push('/')}>Главная</button>
            <button onClick={() => router.push('/owners')} className="text-[#F5B8DA]">Мои объекты</button>
            <button onClick={() => router.push('/reports')}>Отчёты</button>
            <button onClick={() => router.push('/profile')}>Профиль</button>
            <button onClick={handleLogout} className="mt-4 text-[#F5B8DA]">Выйти</button>
          </nav>
        </div>

        {/* Список объектов */}
        <div className="flex-row min-w-[20px] pl-5 overflow-y-auto">
          <button
            onClick={() => setShowModal(true)}
            className="font-daysone px-3 py-1 mx-2 my-2 rounded bg-[#FAE2E2] hover:bg-[#E2EAFA]"
          >
            + Добавить
          </button>
          <div className='flex flex-col min-w-[300px]'>
          {properties.map((property) => (
            <div
              key={property.id}
              onClick={() => {
                setSelectedProperty(property)
                if (isMobile) setDetailsOpen(true)
              }}
              className={`cursor-pointer rounded my-2 ${
                selectedProperty?.id === property.id ? 'ml-10' : 'hover:ml-10'
              }`}
            >
              <ObjectCard
                property={property}
                selected={selectedProperty?.id === property.id}
                owners={property.owners || []}
              />
            </div>
          ))}
          </div>
        </div>

        {/* Правая колонка (детали объекта) */}
        {!isMobile && (
          <div className="flex-grow max-w-[600px] overflow-y-auto">
            {selectedProperty ? (
              <ObjectDetails
                property={selectedProperty}
                onUpdated={reloadProperties}
              />
            ) : (
              <p className="text-gray-500">Выберите объект слева</p>
            )}
          </div>
        )}
      </div>

      {/* Модальное окно деталей (мобильный) */}
      <AnimatePresence>
        {isMobile && detailsOpen && selectedProperty && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl p-4 backdrop-blur-md max-h-[100vh] overflow-y-auto"
          >
            <button
              className="text-gray-500 float-right"
              onClick={() => setDetailsOpen(false)}
            >
              ✕ Закрыть
            </button>
            <ObjectDetails
              property={selectedProperty}
              onUpdated={() => {
                reloadProperties()
                setDetailsOpen(false)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Сайдбар меню (мобильный) */}
      <AnimatePresence>
        {isMobile && showMenuMobile && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-0 right-0 w-3/4 h-full bg-[#131313] text-white p-6 z-50 shadow-xl"
          >
            <button
              className="text-right mb-4"
              onClick={() => setShowMenuMobile(false)}
            >
              ✕
            </button>
            <nav className="flex flex-col gap-3 text-[18px] font-comfortaa font-bold">
              <button onClick={() => router.push('/')}>Главная</button>
              <button onClick={() => router.push('/owners')}>Мои объекты</button>
              <button onClick={() => router.push('/reports')}>Отчёты</button>
              <button onClick={() => router.push('/profile')}>Профиль</button>
              <button onClick={handleLogout} className="mt-4 text-[#F5B8DA]">Выйти</button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модалка добавления объекта */}
      {showModal && (
        <div className='overflow-y-auto'>
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
    </div>
  )
}
