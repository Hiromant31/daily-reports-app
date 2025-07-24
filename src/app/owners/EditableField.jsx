// components/EditableField.jsx
import { useState } from 'react'

export default function EditableField({ label, value, onSave, fieldType = 'text', className = '' }) {
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')

  const handleSave = async () => {
    await onSave(inputValue)
    setEditing(false)
  }

  return (
    <div className={`${className}`}>
      <label className="block justify-between w-full text-sm font-medium text-gray-700">{label}</label>
      {editing ? (
        <div className="flex gap-2">
          {fieldType === 'textarea' ? (
            <textarea
              className="w-full rounded"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          ) : (
            <input
              type={fieldType}
              className="w-full  rounded"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          )}
          <button onClick={handleSave} className="bg-green-600 text-white rounded hover:bg-green-700">
            ОК
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center rounded cursor-pointer" onClick={() => setEditing(true)}>
          <span>{value || <span className="text-gray-400">Не указано</span>}</span>
        </div>
      )}
    </div>
  )
}
