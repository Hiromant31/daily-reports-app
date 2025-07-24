'use client'

import { useMemo, useState } from 'react'
import clsx from 'clsx'
import ObjectCard from './ObjectCard' // путь поправь по своему
import StatusMultiSelect from './StatusMultiSelect'  // путь поправь, если нужно


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
  (s) => !['продан', 'снят', 'отказ', 'договор'].includes(s)
)

export default function PropertyList({ properties, selected, onSelect }) {
  const [visibleStatuses, setVisibleStatuses] = useState(defaultVisibleStatuses)

  const filtered = useMemo(
    () => properties.filter((p) => visibleStatuses.includes(p.status || '')),
    [properties, visibleStatuses]
  )

  const toggleStatus = (status) => {
    setVisibleStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Фильтры */}
      <StatusMultiSelect
  allStatuses={allStatuses}
  visibleStatuses={visibleStatuses}
  toggleStatus={toggleStatus}
/>


      {/* Список объектов */}
      <div className="overflow-y-auto px-2 flex flex-col gap-2 mt-2">
        {filtered.length === 0 && (
          <p className="text-gray-500 text-center mt-5">Нет объектов с выбранными статусами</p>
        )}

        {filtered.map((property) => (
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
        ))}
      </div>
    </div>
  )
}
