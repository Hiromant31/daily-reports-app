'use client'

import { useMemo, useState } from 'react'
import clsx from 'clsx'
import ObjectCard from './ObjectCard' // путь проверь
import StatusMultiSelect from './StatusMultiSelect' // путь проверь

const allStatuses = [
  'договор',
  'подписание',
  'на встречу',
  'подождем',
  'не хочу',
  'слился',
  'отказ',
  'продан',
  'снят',
]

const defaultVisibleStatuses = allStatuses.filter(
  (s) => !['продан', 'снят', 'отказ'].includes(s)
)

export default function PropertyList({ properties, selected, onSelect }) {
  const [visibleStatuses, setVisibleStatuses] = useState(defaultVisibleStatuses)
  const [searchTerm, setSearchTerm] = useState('')

  const toggleStatus = (status) => {
    setVisibleStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return properties
      .filter((p) => p && visibleStatuses.includes(p.status || ''))
      .filter((p) => {
        // Проверяем по номеру объекта, адресу и имени владельца
        return (
          (p.object_number?.toString().toLowerCase().includes(term)) ||
          (p.address?.toLowerCase().includes(term)) ||
          (p.owner?.full_name?.toLowerCase().includes(term))
        )
      })
  }, [properties, visibleStatuses, searchTerm])

  return (
    <div className="flex flex-col h-full">
      {/* Фильтры */}
      <StatusMultiSelect
        allStatuses={allStatuses}
        visibleStatuses={visibleStatuses}
        toggleStatus={toggleStatus}
      />

      {/* Поиск */}
      <div className="px-2 mt-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Поиск по № объекта, адресу или имени"
          className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
        />
      </div>

      {/* Список объектов */}
      <div className="overflow-y-auto px-2 flex flex-col gap-2 mt-3">
        {filtered.length === 0 ? (
          <p className="text-gray-500 text-center mt-5">Нет объектов по заданным условиям</p>
        ) : (
          filtered.map((property) => (
            <div
              key={property.id}
              onClick={() => onSelect(property)}
              className={clsx(
                'cursor-pointer',
                selected?.id === property.id ? 'opacity-100' : 'opacity-80 hover:opacity-100'
              )}
            >
              <ObjectCard property={property} selected={selected?.id === property.id} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
