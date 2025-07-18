'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import ObjectCard from './ObjectCard'
import ObjectDetails from './ObjectDetails'
import AddPropertyModal from './AddPropertyModal'

export default function OwnersPage() {
  const [user, setUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()

  const [properties, setProperties] = useState([])
  const [selectedProperty, setSelectedProperty] = useState(null)

  useEffect(() => {
    const fetchUserAndProperties = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const handleLogout = async () => {
    await supabase.auth.signOut()
    location.reload()
    router.push('/login')
  }

      if (user) {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('user_id', user.id)
          .order('next_call_date', { ascending: true })

        if (!error) {
          setProperties(data)
          setSelectedProperty(data?.[0] || null)
        }
        const propertiesWithOwners = await Promise.all(
        propertiesData.map(async (property) => {
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
    setSelectedProperty((prev) => {
      const updated = data.find((p) => p.id === prev?.id)
      return updated || data?.[0] || null
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex relative h-full bg-[#FAF4E4] w-full justify-center m-auto p-[10px] ">
        <div className='flex relative w-9/10 h-full m-auto'>
      {/* Левая колонка */}
      <div className="w-4/10 max-w-[560px] relative h-full flex">
      <div className='bg-[#131313] p-[24px] text-center max-w-[240px] w-2/5 mb-[50px] rounded-[25px] '>
      <div className=""> 
        <span className='font-daysone m-auto text-white text-[32px]'>АЯКС</span>
      </div>
        {/* Меню сверху */}
        <nav className="flex text-[18px] text-white font-comfortaa font-bold border-b m-auto mt-[20px] flex-col gap-3">
          <button
            onClick={() => router.push('/')}
            className="text-left py-[12px] rounded hover:text-[#B8BFF5] transition"
          >
            Главная
          </button>
          <button
            onClick={() => router.push('/owners')}
            className="text-left py-2 rounded text-[#F5B8DA] "
          >
            Мои объекты
          </button>
          <button
            onClick={() => router.push('/reports')}
            className="text-left py-2 rounded hover:text-[#B8BFF5] transition"
          >
            Отчёты
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="text-left py-2 rounded hover:text-[#B8BFF5] transition"
          >
            Профиль
          </button>
                  <div className="p-2 ml-0 border-t">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-[18px] font-semibold text-white hover:[#F5B8DA] transition"
          >
            Выйти
          </button>
        </div>
        </nav>
        </div>

        {/* Список объектов - прокручиваемый */}
        <div className="flex-grow pl-5 overflow-y-auto ">
                <button
            onClick={() => setShowModal(true)}
            className="font-daysone px-3 py-1 mx-2 my-2 rounded bg-[#FAE2E2] hover:bg-[#E2EAFA]"
          >
            + Добавить
          </button>
          {properties.map((property) => (
            <div
              key={property.id}
              onClick={() => setSelectedProperty(property)}
              className={`cursor-pointer rounded my-2 ${
                selectedProperty?.id === property.id ? 'ml-10' : 'hover:ml-10'
              }`}
            >
              <ObjectCard property={property} selected={selectedProperty?.id === property.id} owners={property.owners || []} />
            </div>
          ))}
        </div>

        {/* Кнопка выхода снизу */}

      </div>

      {/* Правая колонка */}
      <div className="flex-grow p-6 overflow-y-auto">
        {selectedProperty ? (
          <ObjectDetails property={selectedProperty} onUpdated={() => {
            // Обновить список объектов после изменений
            const reload = async () => {
              const { data } = await supabase
                .from('properties')
                .select('*')
                .eq('user_id', user.id)
                .order('next_call_date', { ascending: true })
              setProperties(data)
              setSelectedProperty(data?.[0] || null)
            }
            reload()
          }} />
        ) : (
          <p className="text-gray-500">Выберите объект слева</p>
        )}
      </div>

      {/* Модалка для добавления объекта */}
      {showModal && (
        <AddPropertyModal
          user={user}
          onClose={() => setShowModal(false)}
          onCreated={() => {
            const reload = async () => {
              const { data } = await supabase
                .from('properties')
                .select('*')
                .eq('user_id', user.id)
                .order('next_call_date', { ascending: true })
              setProperties(data)
              setSelectedProperty(data?.[0] || null)
            }
            reload()
            setShowModal(false)
          }}
        />
      )}
    </div>
    </div>
  )
}
