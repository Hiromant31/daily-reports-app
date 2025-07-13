'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'

export default function ReportFormModal({ user, profile, onClose, isAdmin = false }) {
  
  const [open, setOpen] = useState(false)

  const toggle = () => setOpen(!open)

  const close = () => setOpen(false)

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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [reportsList, setReportsList] = useState([])
  const [selectedReportIndex, setSelectedReportIndex] = useState(0)

  function loadFormFromData(data) {
    setForm({
      calls_sellers: data.calls_sellers?.toString() || '',
      calls_buyers: data.calls_buyers?.toString() || '',
      stickers: data.stickers?.toString() || '',
      banners: data.banners?.toString() || '',
      statuses: data.statuses?.toString() || '',
      incoming_calls: data.incoming_calls?.toString() || '',
      meetings_sellers: data.meetings_sellers?.toString() || '',
      meetings_buyers: data.meetings_buyers?.toString() || '',
      contracts_sellers: data.contracts_sellers?.toString() || '',
      contracts_buyers: data.contracts_buyers?.toString() || '',
      sma_analytics: data.sma_analytics?.toString() || '',
      showings_buyers: data.showings_buyers?.toString() || '',
      showings_sellers: data.showings_sellers?.toString() || '',
      objects_uploaded: data.objects_uploaded?.toString() || '',
      pro_photos: data.pro_photos?.toString() || '',
      price_reductions: data.price_reductions?.toString() || '',
      sum_price_reduction: data.sum_price_reduction?.toString() || '',
    })
  }


  const dropdownRef = useRef(null)

  // Закрывать меню при клике вне
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  // Обработчик "Изменить" из выпадающего меню
  const handleSubmitDropdown = async () => {
    await handleSubmit(new Event('submit')) // эмулируем submit
    setOpen(false)
  }


  useEffect(() => {
    async function fetchReports() {
      setLoading(true)
      if (!isAdmin) {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', selectedDate)
          .in('status', ['set', 'edit', 'ready'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (data) {
          loadFormFromData(data)
          setHasSetReport(data.status === 'set')
        }
      } else {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', selectedDate)
          .order('created_at', { ascending: true })

        if (data) {
          setReportsList(data)
          if (data.length > 0) {
            loadFormFromData(data[0])
            setSelectedReportIndex(0)
          }
        }
      }
      setLoading(false)
    }
    fetchReports()
  }, [selectedDate, user.id, isAdmin])

  const handleChange = (field, value) => {
    if (/^\d*$/.test(value)) {
      setForm(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  const cleanData = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, parseInt(value) || 0]))

  // Получаем текущий выбранный отчет (если есть)
  const currentReport = reportsList[selectedReportIndex]

  if (currentReport) {
    // Обновляем существующий отчет
    const { error } = await supabase
      .from('reports')
      .update({ ...cleanData, status: currentReport.status })
      .eq('id', currentReport.id)

    if (error) {
      alert('Ошибка при обновлении отчета')
    } else {
      alert('Отчет обновлен')
      onClose?.()
      // Обновляем локальный список отчетов и форму
      const updatedReports = [...reportsList]
      updatedReports[selectedReportIndex] = { ...currentReport, ...cleanData }
      setReportsList(updatedReports)
    }
  } else {
    // Если отчета нет, создаём новый
    const status = hasSetReport ? 'edit' : 'set'
    const { error } = await supabase.from('reports').insert({
      ...cleanData,
      date: selectedDate,
      user_id: user.id,
      status,
    })

    if (error) {
      alert('Ошибка при сохранении отчета')
    } else {
      alert(status === 'set' ? 'Отчет сохранен' : 'Отчет изменён')
      onClose?.()
    }
  }
}

  const handleUpdateStatus = async (status) => {
  const report = reportsList[selectedReportIndex]
  if (!report) return alert('Отчет не выбран')

  if (status === 'ready') {
    const { data } = await supabase
      .from('reports')
      .select('id')
      .eq('date', selectedDate)
      .eq('status', 'ready')

    if (data.length > 0) return alert('Уже есть подтвержденный отчет за эту дату')
  }

  const { error } = await supabase.from('reports').update({ status }).eq('id', report.id)

  if (error) {
    alert('Ошибка при изменении статуса')
  } else {
    alert(`Статус изменен на ${status}`)

    // Обновляем локально
    const updatedReports = [...reportsList]
    updatedReports[selectedReportIndex] = { ...report, status }
    setReportsList(updatedReports)

    // Обновляем состояние формы
    loadFormFromData(updatedReports[selectedReportIndex])
  }
}

  if (loading) return null
  const userName = profile?.first_name || 'Пользователь'
  const userInitial = profile?.last_name?.[0] || ''

  return (
    <AnimatePresence>
      <motion.div key="modal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 pt-0 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 pt-6 pb-2 mb-4 flex justify-between items-center">
            <span className="text-sm text-[#e53740] font-semibold">{userName} {userInitial && userInitial + '.'}</span>
            <h2 className="text-xl font-bold text-[#e53740]">Ежедневный отчет</h2>
            <span className="text-sm text-[#e53740] font-semibold">{selectedDate}</span>
          </div>

          {isAdmin && (
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-2">
  <input
    type="date"
    value={selectedDate}
    onChange={e => setSelectedDate(e.target.value)}
    className="border rounded px-3 py-1 text-sm"
  />
  <div className="flex flex-wrap gap-2">
    {reportsList.map((r, idx) => {
      const isSelected = selectedReportIndex === idx

      const statusColor =
        r.status === 'ready'
          ? 'border-green-500 bg-green-500'
          : r.status === 'trash'
          ? 'border-red-500 bg-red-500'
          : r.status === 'edit'
          ? 'border-orange-400 bg-orange-400'
          :  r.status === 'set'
          ?  'border-orange-400 bg-orange-00'
          : 'border-gray-600 bg-gray-600'

      const bgColor = isSelected ? 'text-white' : 'bg-white text-black'

      return (
        <button
          key={r.id}
          onClick={() => {
            loadFormFromData(r)
            setSelectedReportIndex(idx)
          }}
          className={`text-xs px-2 py-1 rounded ${statusColor} border ${bgColor}`}
        >
          #{idx + 1} — {r.status || 'пусто'}
        </button>
      )
    })}
  </div>
</div>

          )}

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
                <input type="number" inputMode="numeric" value={form[field]} onChange={e => handleChange(field, e.target.value)} className="border rounded px-3 py-2 text-sm" placeholder="0" />
              </div>
            ))}

            <div className="col-span-full flex justify-between items-center mt-4">
              <button type="button" onClick={onClose} className="text-sm px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Назад</button>
              {!isAdmin ? (
                <button type="submit" className="text-sm px-4 py-2 bg-[#e53740] text-white rounded hover:bg-[#c72f35]">
                  {hasSetReport ? 'Изменить' : 'Сохранить'}
                </button>
              ) : (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggle}
        className="text-sm px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Действия
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="origin-bottom-right absolute bottom-full right-0 mb-2 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
            onClick={e => e.stopPropagation()}
          >
            <div className="py-1">
              <button
                onClick={() => {
                  handleUpdateStatus('trash')
                  setOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Отклонить
              </button>
              <button
                onClick={() => {
                  handleUpdateStatus('ready')
                  setOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Подтвердить
              </button>
              <button
                type="button"
                onClick={handleSubmitDropdown}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Изменить
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}