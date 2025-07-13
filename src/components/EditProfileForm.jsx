'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function EditProfileForm({ userId }) {
  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('trainee')

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !data) {
        alert('Ошибка загрузки профиля')
        console.error(error)
        return
      }

      setFirstName(data.first_name || '')
      setLastName(data.last_name || '')
      setPhone(data.phone || '')
      setRole(data.role || 'trainee')
      setLoading(false)
    }

    fetchProfile()
  }, [userId])

  const handleSave = async () => {
  console.log('Saving profile for userId:', userId)
  const { data, error } = await supabase
    .from('profiles')
    .update({ first_name: firstName, last_name: lastName, phone, role })
    .eq('id', userId)
    .select()

  if (error) {
    alert('Ошибка при сохранении')
    console.error('Supabase error:', error)
    return
  }

  if (!data || data.length === 0) {
    alert('Запись не была обновлена')
    console.warn('No rows updated')
    return
  }

  alert('Профиль обновлён')
  console.log('Обновленные данные:', data)
}


  if (loading) return <div>Загрузка...</div>

  return (
    <div>
      <h2 className="text-lg font-bold mb-4 text-[#e53740]">Редактирование профиля</h2>

      <label className="block mb-1">Имя:</label>
      <input className="border w-full mb-3 p-2 rounded" value={firstName} onChange={e => setFirstName(e.target.value)} />

      <label className="block mb-1">Фамилия:</label>
      <input className="border w-full mb-3 p-2 rounded" value={lastName} onChange={e => setLastName(e.target.value)} />

      <label className="block mb-1">Телефон:</label>
      <input className="border w-full mb-3 p-2 rounded" value={phone} onChange={e => setPhone(e.target.value)} />

      <label className="block mb-1">Роль:</label>
      <select className="border w-full mb-4 p-2 rounded" value={role} onChange={e => setRole(e.target.value)}>
        <option value="trainee">Стажёр</option>
        <option value="agent">Агент</option>
      </select>

      <button onClick={handleSave} className="bg-[#e53740] text-white px-4 py-2 rounded hover:bg-[#c72f35]">
        Сохранить
      </button>
    </div>
  )
}
