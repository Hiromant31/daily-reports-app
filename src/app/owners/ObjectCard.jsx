'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ObjectCard({ property, selected }) {
  const [owners, setOwners] = useState([])
  const [loadingOwners, setLoadingOwners] = useState(true)
  const [error, setError] = useState(null)

  // Загрузка собственников при монтировании или изменении property
  useEffect(() => {
    if (!property?.id) return

    const fetchOwners = async () => {
      setLoadingOwners(true)
      setError(null)

      const { data, error } = await supabase
        .from('property_owners')
        .select(`owners (id, full_name, phone)`)
        .eq('property_id', property.id)

      if (error) {
        setError('Ошибка загрузки собственников')
        setOwners([])
      } else {
        setOwners(data.map(item => item.owners))
      }

      setLoadingOwners(false)
    }

    fetchOwners()
  }, [property])

  // Проверка даты
  const isPastDate = property.next_call_date
    ? new Date(property.next_call_date) < new Date()
    : false

  return (
    <div
      className={`p-3 mb-3 h-[150px] rounded-[25px] cursor-pointer shadow-sm ${
        selected ? 'bg-[#FAE2E2] border-[#FAE2E2]' : 'bg-[#E2EAFA] hover:bg-[#E2EAFA]'
      }`}
    >
      <h3 className="font-bold">{property.description}</h3>

      {/* === Отображение собственника === */}
      {loadingOwners ? (
        <p className="text-sm text-gray-500">Загрузка...</p>
      ) : error ? (
        <p className="text-sm text-red-500">Ошибка</p>
      ) : owners.length === 0 ? (
        <p className="text-sm text-gray-400">Собственник не указан</p>
      ) : (
        owners.map((owner) => (
          <div key={owner.id} className="font-daysone text-[14px]">
            <p className="text-gray-700">{owner.full_name}</p>
            <p className="">{owner.phone}</p>
          </div>
        ))
      )}

      <p className="font-comfortee text-[14px] ">{property.address}</p>
      <p className='font-daysone'>{property.status}</p>
      <p className={`text-[12px] font-daysone ${isPastDate ? 'text-red-500' : ''}`}>
        {property.next_call_date || '—'}
      </p>
    </div>
  )
}