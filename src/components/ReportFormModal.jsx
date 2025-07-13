'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'

export default function ReportFormModal({ user, profile, onClose }) {
  const [form, setForm] = useState({
    calls_sellers: '',
    calls_buyers: '',
    stickers: '',
    banners: '',
    statuses: '',
    incoming_calls: '',
    meetings_sellers: '',
    meetings_buyers: '',
    contracts_sellers: '',
    contracts_buyers: '',
    sma_analytics: '',
    showings_buyers: '',
    showings_sellers: '',
    objects_uploaded: '',
    pro_photos: '',
    price_reductions: '',
    sum_price_reduction: '',
  })
  const [loading, setLoading] = useState(true)
  const [hasSetReport, setHasSetReport] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    // Загружаем последний отчёт за сегодня со статусом 'set'
    async function fetchTodayReport() {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .eq('status', 'set')
        .order('created_at', { ascending: false }) // предположим, есть поле created_at
        .limit(1)
        .single()

      if (error) {
        console.error('Ошибка загрузки отчёта за сегодня:', error)
        setLoading(false)
        return
      }

      if (data) {
        console.log('Найден отчет за сегодня:', data) 
        // Есть отчет за сегодня
        setForm({
          calls_sellers: data.calls_sellers.toString(),
          calls_buyers: data.calls_buyers.toString(),
          stickers: data.stickers.toString(),
          banners: data.banners.toString(),
          statuses: data.statuses.toString(),
          incoming_calls: data.incoming_calls.toString(),
          meetings_sellers: data.meetings_sellers.toString(),
          meetings_buyers: data.meetings_buyers.toString(),
          contracts_sellers: data.contracts_sellers.toString(),
          contracts_buyers: data.contracts_buyers.toString(),
          sma_analytics: data.sma_analytics.toString(),
          showings_buyers: data.showings_buyers.toString(),
          showings_sellers: data.showings_sellers.toString(),
          objects_uploaded: data.objects_uploaded.toString(),
          pro_photos: data.pro_photos.toString(),
          price_reductions: data.price_reductions.toString(),
          sum_price_reduction: data.sum_price_reduction.toString(),
        })
        setHasSetReport(true)
      } else {
        setHasSetReport(false)
      }
      setLoading(false)
    }
    fetchTodayReport()
  }, [user.id, today])

  const handleChange = (field, value) => {
    if (/^\d*$/.test(value)) {
      setForm(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const cleanData = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, parseInt(value) || 0])
    )

    // Статус зависит от наличия отчёта за сегодня с set
    const status = hasSetReport ? 'edit' : 'set'

    const { error } = await supabase.from('reports').insert({
      ...cleanData,
      date: today,
      user_id: user.id,
      status,
    })

    if (error) {
      alert('Ошибка при сохранении отчета')
      console.error(error)
    } else {
      alert(status === 'set' ? 'Отчет сохранен' : 'Отчет изменён')
      onClose?.()
    }
  }

  const userName = profile?.first_name || 'Пользователь'
  const userInitial = profile?.last_name?.[0] || ''

  if (loading) return null

  return (
    <AnimatePresence>
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 pb-2 mb-4 flex justify-between items-center">
            <span className="text-sm text-[#e53740] font-semibold">{userName} {userInitial && userInitial + '.'}</span>
            <h2 className="text-xl font-bold text-[#e53740]">Ежедневный отчет</h2>
            <span className="text-sm text-[#e53740] font-semibold">{today}</span>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries({
              calls_sellers: 'Звонки продавцам',
              calls_buyers: 'Звонки покупателям',
              incoming_calls: 'Входящие звонки',
              statuses: 'Статусы',
              banners: 'Баннеры',
              stickers: 'Расклейка',
              meetings_sellers: 'Встречи с продавцами',
              meetings_buyers: 'Встречи с покупателями',
              showings_sellers: 'Показы продавцов',
              showings_buyers: 'Показы покупателей',
              contracts_sellers: 'Договоры с продавцами',
              contracts_buyers: 'Договоры с покупателями',
              sma_analytics: 'Аналитика СМА',
              objects_uploaded: 'Объекты внесены',
              pro_photos: 'Проф. фото',
              price_reductions: 'Снижения цены (шт)',
              sum_price_reduction: 'Сумма снижений (₽)',
            }).map(([field, label]) => (
              <div key={field} className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">{label}</label>
                <input
                  type="number"
                  inputMode="numeric"
                  
                  value={form[field]}
                  onChange={e => handleChange(field, e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                  placeholder="0"
                />
              </div>
            ))}

            <div className="col-span-full flex justify-between items-center mt-4">
              <button
                type="button"
                onClick={onClose}
                className="text-sm px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="text-sm px-4 py-2 bg-[#e53740] text-white rounded hover:bg-[#c72f35]"
              >
                {hasSetReport ? 'Изменить' : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
