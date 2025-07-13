'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useSearchParams } from 'next/navigation'

export default function EditProfileForm({ userId }) {
  const router = useRouter()
  const searchParams = useSearchParams()
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

  useEffect(() => {
    document.body.classList.add('overflow-hidden')
    return () => document.body.classList.remove('overflow-hidden')
  }, [])

  const handleSave = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ first_name: firstName, last_name: lastName, phone, role })
      .eq('id', userId)
      .select()

    if (error) {
      alert('Ошибка при сохранении')
      console.error(error)
      return
    }

    alert('Профиль обновлён')
    // После сохранения закрываем модалку (то есть убираем параметр settings из URL)
    closeModal()
  }

  // Функция закрытия модального окна — убирает параметр settings из URL
  function closeModal() {
    // Получаем текущий id из параметров
    const id = searchParams.get('id')
    // Переходим обратно на /admin?id=...
    router.push(id ? `/admin?id=${id}` : '/admin')
  }

  if (loading) return null

  return (
    <AnimatePresence>
      <motion.div
        key="edit-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white pb-3 mb-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#e53740]">Редактирование профиля</h2>
            <button
              onClick={closeModal}
              className="text-[#e53740] text-2xl leading-none font-bold"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>

          <label className="block mb-1">Имя:</label>
          <input
            className="border w-full mb-3 p-2 rounded"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
          />

          <label className="block mb-1">Фамилия:</label>
          <input
            className="border w-full mb-3 p-2 rounded"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          />

          <label className="block mb-1">Телефон:</label>
          <input
            className="border w-full mb-3 p-2 rounded"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />

          <label className="block mb-1">Роль:</label>
          <select
            className="border w-full mb-4 p-2 rounded"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="trainee">Стажёр</option>
            <option value="agent">Агент</option>
          </select>

          <button
            onClick={handleSave}
            className="bg-[#e53740] text-white px-4 py-2 rounded hover:bg-[#c72f35] w-full"
          >
            Сохранить
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
