import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ObjectDetails({ property, onUpdated }) {
  // Состояния
  const [date, setDate] = useState(property.next_call_date || '')
  const [savingDate, setSavingDate] = useState(false)
  const [dateMessage, setDateMessage] = useState('')

  const [owners, setOwners] = useState([])
  const [loadingOwners, setLoadingOwners] = useState(false)

  const [calls, setCalls] = useState([])
  const [loadingCalls, setLoadingCalls] = useState(false)

  const [editCallId, setEditCallId] = useState(null)
  const [editCall, setEditCall] = useState('')

  const [newCall, setNewCall] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  // Обновляем date при смене property
  useEffect(() => {
    setDate(property.next_call_date || '')
  }, [property])

  // Загрузка собственников
  useEffect(() => {
    if (!property) return
    setLoadingOwners(true)

    const fetchOwners = async () => {
      const { data, error } = await supabase
        .from('property_owners')
        .select(`
          owners (
            id,
            full_name,
            phone
          )
        `)
        .eq('property_id', property.id)

      if (!error && data) {
        setOwners(data.map(item => item.owners))
      } else {
        setOwners([])
      }
      setLoadingOwners(false)
    }

    fetchOwners()
  }, [property])

  // Загрузка прозвонов
  useEffect(() => {
    if (!property) return
    setLoadingCalls(true)

    const fetchCalls = async () => {
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .eq('property_id', property.id)
        .order('call_date', { ascending: false })

      if (!error && data) {
        setCalls(data)
        // Автоустановка редактирования последнего прозвона
        if (data.length > 0) {
          setEditCallId(data[0].id)
          setEditCall(data[0].comment)
        } else {
          setEditCallId(null)
          setEditCall('')
        }
      } else {
        setCalls([])
        setEditCallId(null)
        setEditCall('')
      }
      setLoadingCalls(false)
    }

    fetchCalls()
  }, [property])

  // Обработчик изменения даты next_call_date
  const handleDateChange = async (e) => {
    const newDate = e.target.value
    setDate(newDate)
    setSavingDate(true)

    const { error } = await supabase
      .from('properties')
      .update({ next_call_date: newDate })
      .eq('id', property.id)

    if (!error) {
      setDateMessage('Дата обновлена')
      if (onUpdated) onUpdated()
    } else {
      setDateMessage('Ошибка при сохранении')
    }

    setSavingDate(false)

    setTimeout(() => setDateMessage(''), 2000)
  }

  // Сохранение редактируемого прозвона
  const handleSaveEdit = async () => {
    if (!editCallId) return
    setSaveMessage('Сохраняю...')

    const { error } = await supabase
      .from('calls')
      .update({ comment: editCall, call_date: new Date().toISOString().slice(0, 10) })
      .eq('id', editCallId)

    if (!error) {
      setSaveMessage('Прозвон сохранён')
      // Перезагрузка прозвонов
      if (property) {
        const { data } = await supabase
          .from('calls')
          .select('*')
          .eq('property_id', property.id)
          .order('call_date', { ascending: false })

        setCalls(data)
        if (data.length > 0) {
          setEditCallId(data[0].id)
          setEditCall(data[0].comment)
        }
      }
      if (onUpdated) onUpdated()
    } else {
      setSaveMessage('Ошибка при сохранении прозвона')
    }

    setTimeout(() => setSaveMessage(''), 2000)
  }

  // Добавление нового прозвона
  const handleAddNewCall = async () => {
    if (!newCall.trim()) return
    setSaveMessage('Добавляю прозвон...')

    const callDate = new Date().toISOString().slice(0, 10)

    const { error } = await supabase
      .from('calls')
      .insert([{ property_id: property.id, call_date: callDate, comment: newCall }])

    if (!error) {
      setSaveMessage('Прозвон добавлен')
      setNewCall('')
      // Перезагрузка прозвонов
      if (property) {
        const { data } = await supabase
          .from('calls')
          .select('*')
          .eq('property_id', property.id)
          .order('call_date', { ascending: false })

        setCalls(data)
        if (data.length > 0) {
          setEditCallId(data[0].id)
          setEditCall(data[0].comment)
        }
      }
      if (onUpdated) onUpdated()
    } else {
      setSaveMessage('Ошибка при добавлении прозвона')
    }

    setTimeout(() => setSaveMessage(''), 2000)
  }

  return (
    <div className="bg-[#FAE2E2] shadow p-6 rounded-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Объект</h2>

      {/* Дата следующего прозвона */}
      <label className="block text-sm text-gray-700 font-medium mb-1">
        Следующий прозвон:
      </label>
      <div className="flex items-center gap-2 mb-4">
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="border p-2 rounded-md"
        />
        {savingDate && <span className="text-sm text-gray-500">Сохранение...</span>}
        {dateMessage && <span className="text-sm text-green-600">{dateMessage}</span>}
      </div>

      <h2 className="text-2xl font-bold mb-2">Характеристики</h2>
      <p><strong>Тип:</strong> {property.property_type}</p>
      <p><strong>Описание:</strong> {property.description}</p>
      <p><strong>Адрес:</strong> {property.address}</p>
      <p><strong>Статус:</strong> {property.status}</p>
      <p><strong>Комментарий:</strong> {property.note}</p>

      <hr className="my-6" />

      <h2 className="text-2xl font-bold mb-2">Собственники</h2>
      {loadingOwners ? (
        <p>Загрузка собственников...</p>
      ) : owners.length === 0 ? (
        <p className="text-gray-500">Собственники не найдены</p>
      ) : (
        owners.map(owner => (
          <div key={owner.id} className="mb-2">
            <p><b>{owner.full_name}</b></p>
            <p className="text-sm text-gray-600">{owner.phone}</p>
          </div>
        ))
      )}

      <hr className="my-6" />

      <h2 className="text-2xl font-bold mb-2">Последний прозвон</h2>
      {loadingCalls ? (
        <p>Загрузка прозвонов...</p>
      ) : editCallId ? (
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">
            Комментарий ({calls.find(c => c.id === editCallId)?.call_date || '—'})
          </label>
          <textarea
            className="w-full h-24 border border-gray-300 rounded-md p-2"
            value={editCall}
            onChange={e => setEditCall(e.target.value)}
          />
          <button
            onClick={handleSaveEdit}
            className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Сохранить прозвон
          </button>
        </div>
      ) : (
        <p className="text-gray-500">Нет прозвонов</p>
      )}

      {saveMessage && <p className="text-green-600 text-sm mb-4">{saveMessage}</p>}

      <hr className="my-6" />

      <h2 className="text-2xl font-bold mb-2">Добавить новый прозвон</h2>
      <textarea
        className="w-full h-24 border border-gray-300 rounded-md p-2"
        placeholder="Комментарий..."
        value={newCall}
        onChange={e => setNewCall(e.target.value)}
      />
      <button
        onClick={handleAddNewCall}
        className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Добавить
      </button>

      <hr className="my-6" />

      <h2 className="text-2xl font-bold mb-2">Все прозвоны</h2>
      {calls.length === 0 ? (
        <p className="text-gray-500">Прозвонов нет</p>
      ) : (
        calls.map(call => (
          <div key={call.id} className="mb-2">
            <p className="text-sm text-gray-500">{call.call_date}</p>
            <p className="text-gray-800">{call.comment}</p>
          </div>
        ))
      )}
    </div>
  )
}
