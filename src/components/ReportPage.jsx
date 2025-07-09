'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ReportPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({
    calls_sellers: 0,
    calls_buyers: 0,
    stickers: 0,
    banners: 0,
    statuses: 0,
    incoming_calls: 0,
    meetings_sellers: 0,
    meetings_buyers: 0,
    contracts_sellers: 0,
    contracts_buyers: 0,
    sma_analytics: 0,
    showings_buyers: 0,
    showings_sellers: 0,
    objects_uploaded: 0,
    pro_photos: 0,
    price_reductions: 0,
    sum_price_reduction: 0,
  })

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      setUser(user)
    }
    getUser()
  }, [router])

  const handleChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: field === 'sum_price_reduction' ? parseFloat(value) : parseInt(value)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { error } = await supabase.from('reports').insert({
      ...form,
      date: today,
      user_id: user.id
    })

    if (error) {
      alert('Ошибка при сохранении отчета')
      console.error(error)
    } else {
      alert('Отчет сохранен')
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        {/* Заголовок */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Ежедневный отчет</h1>
          <Link href="/" className="text-indigo-600 hover:underline">
            ← На главную
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Группа 1 — Звонки и контакты */}
          <fieldset className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <FormInput label="Звонки продавцам" value={form.calls_sellers} onChange={v => handleChange('calls_sellers', v)} />
            <FormInput label="Звонки покупателям" value={form.calls_buyers} onChange={v => handleChange('calls_buyers', v)} />
            <FormInput label="Входящие звонки" value={form.incoming_calls} onChange={v => handleChange('incoming_calls', v)} />
            <FormInput label="Статусы" value={form.statuses} onChange={v => handleChange('statuses', v)} />
            <FormInput label="Баннеры" value={form.banners} onChange={v => handleChange('banners', v)} />
            <FormInput label="Расклейка" value={form.stickers} onChange={v => handleChange('stickers', v)} />
          </fieldset>

          {/* Группа 2 — Встречи, договоры, показы */}
          <fieldset className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <FormInput label="Встречи с продавцами" value={form.meetings_sellers} onChange={v => handleChange('meetings_sellers', v)} />
            <FormInput label="Встречи с покупателями" value={form.meetings_buyers} onChange={v => handleChange('meetings_buyers', v)} />
            <FormInput label="Показы продавцов" value={form.showings_sellers} onChange={v => handleChange('showings_sellers', v)} />
            <FormInput label="Показы покупателей" value={form.showings_buyers} onChange={v => handleChange('showings_buyers', v)} />
            <FormInput label="Договоры с продавцами" value={form.contracts_sellers} onChange={v => handleChange('contracts_sellers', v)} />
            <FormInput label="Договоры с покупателями" value={form.contracts_buyers} onChange={v => handleChange('contracts_buyers', v)} />
          </fieldset>

          {/* Группа 3 — Объекты, аналитика, снижение */}
          <fieldset className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <FormInput label="Аналитика СМА" value={form.sma_analytics} onChange={v => handleChange('sma_analytics', v)} />
            <FormInput label="Внесение объектов" value={form.objects_uploaded} onChange={v => handleChange('objects_uploaded', v)} />
            <FormInput label="Профессиональные фото" value={form.pro_photos} onChange={v => handleChange('pro_photos', v)} />
            <FormInput label="Снижение цены (шт)" value={form.price_reductions} onChange={v => handleChange('price_reductions', v)} />
            <FormInput label="Сумма снижений (₽)" value={form.sum_price_reduction} onChange={v => handleChange('sum_price_reduction', v)} />
          </fieldset>

          {/* Кнопка отправки */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md font-semibold transition duration-200"
            >
              Сохранить отчет
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Компонент поля ввода
function FormInput({ label, value, onChange }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="border rounded px-3 py-2 text-sm"
        min={0}
      />
    </div>
  )
}