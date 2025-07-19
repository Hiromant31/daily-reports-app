'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import CustomDatePicker from './CustomDatePicker'

export default function AddPropertyModal({ user, onClose, onCreated }) {
  const [form, setForm] = useState({
    description: '',
    address: '',
    property_type: 'квартира',
    status: 'договор',
    note: '',
    next_call_date: '',
    owner_name: '',
    owner_phone: '',
    call_comment: '',
    object_number: '',
    source_link: '',
  })

  const [date, setDate] = useState('')

  useEffect(() => {
    if (form.next_call_date) {
      setDate(form.next_call_date)
    } else {
      setDate(new Date().toISOString().split('T')[0])
    }
  }, [])

  const handleDateChange = (newDate) => {
    setDate(newDate)
    setForm(prev => ({ ...prev, next_call_date: newDate }))
  }

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // 1. Создать объект
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .insert([
          {
            user_id: user.id,
            description: form.description,
            address: form.address,
            property_type: form.property_type,
            status: form.status,
            note: form.note,
            object_number: form.object_number,
            source_link: form.source_link,
            note_date: new Date().toISOString().split('T')[0],
            next_call_date: form.next_call_date || new Date().toISOString().split('T')[0],
          },
        ])
        .select()
        .single()

      if (propertyError) throw propertyError

      // 2. Создать собственника
      const { data: ownerData, error: ownerError } = await supabase
        .from('owners')
        .insert([
          {
            user_id: user.id,
            full_name: form.owner_name,
            phone: form.owner_phone,
          },
        ])
        .select()
        .single()

      if (ownerError) throw ownerError

      // 3. Связать через property_owners
      const { error: linkError } = await supabase
        .from('property_owners')
        .insert([
          {
            property_id: propertyData.id,
            owner_id: ownerData.id,
          },
        ])

      if (linkError) throw linkError

      // 4. Добавить прозвон
      if (form.call_comment.trim()) {
        await supabase.from('calls').insert([
          {
            property_id: propertyData.id,
            comment: form.call_comment,
            call_date: new Date().toISOString().split('T')[0],
          },
        ])
      }

      onCreated()
      onClose()
    } catch (err) {
      console.error('Ошибка при создании объекта:', err)
      setError('Ошибка при создании объекта. Проверь поля.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 backdrop-blur-md flex justify-center items-center overflow-y-auto z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Добавить объект</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Описание</label>
            <input
              name="description"
              onChange={handleChange}
              value={form.description}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label>Адрес</label>
            <input
              name="address"
              onChange={handleChange}
              value={form.address}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label>Тип</label>
            <select
              name="property_type"
              onChange={handleChange}
              value={form.property_type}
              className="w-full border p-2 rounded"
            >
              <option value="квартира">Квартира</option>
              <option value="дом">Дом</option>
              <option value="земля">Земля</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Статус</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
            >
              <option value="договор">договор</option>
              <option value="подписание">подписание</option>
              <option value="на встречу">на встречу</option>
              <option value="подождем">подождем</option>
              <option value="не хочу">не хочу</option>
              <option value="слился">слился</option>
              <option value="отказ">отказ</option>
              <option value="продан">продан</option>
              <option value="снят">снят</option>
            </select>
          </div>

          <div className="col-span-2">
            <label>Комментарий к объекту</label>
            <textarea
              name="note"
              onChange={handleChange}
              value={form.note}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <hr className="my-4" />

        <h3 className="text-xl font-semibold mb-2">Собственник</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Имя</label>
            <input
              name="owner_name"
              onChange={handleChange}
              value={form.owner_name}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label>Телефон</label>
            <input
              name="owner_phone"
              onChange={handleChange}
              value={form.owner_phone}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>НО</label>
            <input
              name="object_number"
              onChange={handleChange}
              value={form.object_number}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label>Ссылка</label>
            <input
              name="source_link"
              onChange={handleChange}
              value={form.source_link}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <hr className="my-4" />

        <h3 className="text-xl font-semibold mb-2">Первый прозвон</h3>
        <div>
          <label className="block text-sm font-medium">Дата следующего звонка</label>
          <CustomDatePicker
            selectedDate={date}
            onChange={handleDateChange}
            direction='up'
          />
        </div>
        <textarea
          name="call_comment"
          onChange={handleChange}
          value={form.call_comment}
          placeholder="Комментарий к первому прозвону"
          className="w-full border p-2 rounded"
        />

        {error && <p className="text-red-600 mt-2">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}
