'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function EditableLink({ initialLink, propertyId, onUpdated }) {
  const [isEditing, setIsEditing] = useState(false)
  const [link, setLink] = useState(initialLink)
  const [inputValue, setInputValue] = useState(initialLink)
  const maxLength = 20

  // Обновляем состояние при изменении initialLink (например, при смене карточки)
  useEffect(() => {
    setLink(initialLink)
    setInputValue(initialLink)
  }, [initialLink])

  const handleSave = async () => {
    if (inputValue === link) {
      setIsEditing(false)
      return
    }

    // Обновляем в Supabase
    const { error } = await supabase
      .from('properties')
      .update({ source_link: inputValue })
      .eq('id', propertyId)

    if (!error) {
      setLink(inputValue)
      setIsEditing(false)
      if (onUpdated) onUpdated()
    } else {
      alert('Ошибка при сохранении ссылки')
      console.error(error)
    }
  }

  const displayText = link ? (
    link.length > maxLength ? link.slice(0, maxLength) + '...' : link
  ) : (
    <span className="text-gray-400">Ссылка не указана</span>
  )

  return (
    <div className="flex text-[12px] items-center font-daysone justify-between w-full max-w-md">
      {isEditing ? (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-grow px-2 py-1 border border-gray-300 rounded text-[12px]"
          autoFocus
        />
      ) : (
        <a
          href={link || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="relative text-blue-500 after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all after:duration-300 hover:after:w-full"
          title={link}
        >
          {displayText}
        </a>
      )}

      <div className="ml-2">
        {isEditing ? (
          <button
            onClick={handleSave}
            className="text-green-600 hover:text-green-800 text-sm font-bold"
          >
            Сохранить
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Редактировать ссылку"
          >
          <span className=''>Изменить</span>
          </button>
        )}
      </div>
    </div>
  )
}