'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'


export default function AddPropertyForm({ user, onAdd }) {
  const [form, setForm] = useState({
    property_type: 'квартира',
    address: '',
    description: '',
    status: 'договор',
    next_call_date: '',
    owner_full_name: '',
    owner_phone: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { property_type, address, description, status, next_call_date, owner_full_name, owner_phone } = form

    if (!address.trim()) return alert('Введите адрес')

    // Шаг 1: Добавляем собственника
    let owner_id = null
    if (owner_full_name.trim()) {
      const { data: ownerData, error: ownerError } = await supabase
        .from('owners')
        .insert({
          full_name: owner_full_name,
          phone: owner_phone,
          user_id: user.id,
        })
        .select()
        .single()

      if (ownerError) {
        console.error('Ошибка при добавлении собственника:', ownerError.message)
        return alert('Ошибка при добавлении собственника')
      }
      owner_id = ownerData.id
    }

    // Шаг 2: Добавляем объект
    const { data: propertyData, error: propertyError } = await supabase
      .from('properties')
      .insert({
        property_type,
        address,
        description,
        object_number,
        status,
        next_call_date: next_call_date || null,
        user_id: user.id,
      })
      .select()
      .single()

    if (propertyError) {
      console.error('Ошибка при добавлении объекта:', propertyError.message)
      return alert('Ошибка при добавлении объекта')
    }

    const property_id = propertyData.id

    // Шаг 3: Создаем связь объект-собственник
    if (owner_id) {
      const { error: linkError } = await supabase
        .from('property_owners')
        .insert({ property_id, owner_id })

      if (linkError) {
        console.error('Ошибка при создании связи:', linkError.message)
        return alert('Ошибка при связывании объекта и собственника')
      }
    }

    // Шаг 4: Опционально — добавляем прозвон
    if (next_call_date) {
      await supabase.from('calls').insert({
        property_id,
        call_date: new Date().toISOString(),
        comment: 'Первый прозвон при добавлении объекта',
      })
    }

    alert('Объект успешно добавлен!')
    onAdd?.(propertyData)
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Добавить объект</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Адрес</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Тип</label>
          <select
            name="property_type"
            value={form.property_type}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="квартира">Квартира</option>
            <option value="дом">Дом</option>
            <option value="земля">Земля</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Описание</label>
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Статус</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="договор">Договор</option>
            <option value="подписание">Подписание</option>
            <option value="на встречу">На встречу</option>
            <option value="подождем">Подождем</option>
            <option value="слился">Слился</option>
            <option value="отказ">Отказ</option>
            <option value="продан">Продан</option>
            <option value="снят">Снят</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Дата следующего звонка</label>
          <input
            type="date"
            name="next_call_date"
            value={form.next_call_date}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <hr className="my-4" />

        <div>
          <label className="block text-sm font-medium">Имя собственника</label>
          <input
            type="text"
            name="owner_full_name"
            value={form.owner_full_name}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Необязательно"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">НО</label>
          <input
            type="text"
            name="owner_full_name"
            value={form.object_number}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Необязательно"
          />
        </div>        

        <div>
          <label className="block text-sm font-medium">Телефон собственника</label>
          <input
            type="text"
            name="owner_phone"
            value={form.owner_phone}
            onChange={handleChange}
            className="w-full border rounded p-2"
            placeholder="Необязательно"
          />
        </div>

        <button
          type="submit"
          className="mt-4 bg-[#e53740] text-white py-2 px-4 rounded hover:bg-red-600 transition"
        >
          Сохранить объект
        </button>
      </form>
    </div>
  )
}