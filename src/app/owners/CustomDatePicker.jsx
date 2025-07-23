'use client'

import { useState, useRef, useEffect } from 'react'

export default function CustomDatePicker({ selectedDate, onChange, direction = 'down' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(selectedDate ? new Date(selectedDate) : new Date())
  const [position, setPosition] = useState('right-0')
  const datePickerRef = useRef(null)
  const buttonRef = useRef(null)

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]

  const getStartOffset = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const dayOfWeek = firstDay.getDay() // воскресенье = 0, понедельник = 1, ...
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1 // сдвиг, чтобы неделя начиналась с ПН
  }

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const startOffset = getStartOffset()

  const days = []

  for (let i = 0; i < startOffset; i++) {
    days.push(<div key={`empty-${i}`} className="w-8 h-8" />)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
    const dateStr = currentDay.toISOString().slice(0, 10)
    const isSelected = selectedDate === dateStr
    const isToday = dateStr === todayStr

    days.push(
      <div
        key={i}
        onClick={() => {
          onChange(dateStr)
          setIsOpen(false)
        }}
        className={`
          w-8 h-8 flex items-center justify-center cursor-pointer rounded-full
          ${isSelected ? 'bg-red-500 text-white' : isToday ? 'bg-gray-200 font-bold' : 'hover:bg-red-100'}
        `}
      >
        {i}
      </div>
    )
  }

  useEffect(() => {
    if (!isOpen) return
    const buttonRect = buttonRef.current?.getBoundingClientRect()
    const calendarWidth = 250
    const spaceRight = window.innerWidth - buttonRect.right

    setPosition(spaceRight < calendarWidth ? 'right-0' : 'left-0')
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target) &&
        buttonRef.current !== event.target &&
        !buttonRef.current?.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))

  const dropdownPositionClass = direction === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'

  return (
    <div ref={datePickerRef} className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-[12px] text-red-500 font-daysone"
      >
        {selectedDate || 'Выберите дату'}
      </button>


      {isOpen && (
        <div
          className={`absolute ${dropdownPositionClass} ${position} w-[250px] bg-white border border-gray-300 shadow-lg rounded-lg p-4 z-50 animate-fade-in-down`}
        >
          <div className="flex items-center justify-between mb-2">
            <button onClick={prevMonth} className="text-gray-600 hover:text-gray-900">{'<'}</button>
            <div className="text-sm font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
            <button onClick={nextMonth} className="text-gray-600 hover:text-gray-900">{'>'}</button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-600">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
              <div key={day} className="font-medium">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 mt-1">
            {days}
          </div>
        </div>
      )}
    </div>
  )
}
