import { useState, useRef, useEffect } from 'react'

export default function StatusMultiSelect({ allStatuses, visibleStatuses, toggleStatus }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Закрывать dropdown при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Счетчик выбранных статусов
  const selectedCount = visibleStatuses.length

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex font-comfortaa justify-between items-center w-48 px-4 py-2 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
      >
        Статусы {selectedCount > 0 ? `(${selectedCount})` : ''}
        <svg
          className={`ml-2 h-5 w-5 transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute mt-1 w-48 rounded-md bg-white shadow-lg max-h-60 overflow-auto z-20 border border-gray-200">
          <div className="py-1">
            {allStatuses.map((status) => (
              <label
                key={status}
                className="flex items-center px-3 py-2 font-comfortaa text-sm cursor-pointer hover:bg-gray-100 select-none"
              >
                <input
                  type="checkbox"
                  checked={visibleStatuses.includes(status)}
                  onChange={() => toggleStatus(status)}
                  className="mr-2 cursor-pointer"
                />
                <span>{status}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
