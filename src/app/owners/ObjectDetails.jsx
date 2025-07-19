import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import EditableLink from './EditableLink'
import CustomDatePicker from './CustomDatePicker'

export default function ObjectDetails({ property, onUpdated }) {
  // Состояния
  const [date, setDate] = useState(property.next_call_date || '')
  const [link, setLink] = useState(property.source_link || '')
  const [savingDate, setSavingDate] = useState(false)
  const [dateMessage, setDateMessage] = useState('')

  const [notification, setNotification] = useState('')

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

  useEffect(() => {
  if (property?.source_link !== undefined) {
    // Обновляем состояние ссылки при смене property
    setLink(property.source_link || '')
  }
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

  const handleLinkUpdated = async () => {
  // Перезагружаем текущий объект из базы
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', property.id)
    .single()

    setLink(data.source_link || '') // Обновляем локальное состояние
    if (onUpdated) onUpdated(data)

  if (!error && data) {
    // Обновляем текущий объект в состоянии
    if (onUpdated) onUpdated(data)
  }
}
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
    <div className="bg-[#FAE2E2] shadow p-6 rounded-lg min-w-[600px] max-w-[full] mx-5">
      <div className='flex justify-between'>
            <h2 className="text-[32px] font-daysone mb-2">Собственник</h2>
            <div className='flex flex-col'>
                  <label className="block text-sm text-right mr-1 font-daysone text-[12px] font-medium">
        Набрать
      </label>
      
        <CustomDatePicker
  selectedDate={date}
  onChange={async (newDate) => {
    setDate(newDate)
    const { error } = await supabase
      .from('properties')
      .update({ next_call_date: newDate })
      .eq('id', property.id)

    if (!error && onUpdated) {
      onUpdated()
    }
  }}
/>
      </div>
      </div>
      {loadingOwners ? (
        <p>Загрузка собственников...</p>
      ) : owners.length === 0 ? (
        <p className="text-gray-500">Собственники не найдены</p>
      ) : (
        owners.map(owner => (
          <div key={owner.id} className=" font-daysone mb-[20px] text-[16px] ">
            <div className='grid grid-cols-4 my-[10px] gap-2 rounded-[10px] border border-[#131313]'>
              <div className='pl-[10px] text-white rounded-[8px] bg-[#131313] w-full'>Имя</div>
              <div className='col-span-2 pl-20px'>{owner.full_name}</div>
            </div>
            <div className='grid grid-cols-4 gap-2 rounded-[10px] border border-[#131313]'>
              <div className='pl-[10px] text-white rounded-[8px] bg-[#131313] w-full'>Телефон</div>
              <div className='col-span-2 pl-20px'>{owner.phone}</div>
              </div>
          </div>
        ))
      )}
      <h2 className="text-[32px] font-daysone mb-2">Объект</h2>

      {/* Дата следующего прозвона */}


      <h2 className="text-2xl font-bold mb-2"></h2>
      <div className=" font-daysone mb-[20px] text-[16px] ">
            <div className='grid grid-cols-4 my-[10px] gap-2 rounded-[10px] border border-[#131313]'>
              <div className='pl-[10px] text-white rounded-[8px] bg-[#131313] w-full'>{property.property_type}</div>
              <div className='col-span-2 pl-20px'>{property.description}</div>
            </div>
            <div className='grid grid-cols-4 gap-2 rounded-[10px] border border-[#131313]'>
              <div className='pl-[10px] text-white rounded-[8px] bg-[#131313] w-full'>Адрес</div>
              <div className='col-span-2 pl-20px'>{property.address}</div>
              </div>
          </div>
          <EditableLink
  initialLink={property.source_link || ''}
  propertyId={property.id}
  onUpdated={handleLinkUpdated}
/>

{/* Редактируемый статус с цветом фона */}
<div className="mt-4">
  <label className="block font-medium text-gray-700 mb-1">Статус</label>
  <select
    value={property.status || ''}
    onChange={async (e) => {
      const newStatus = e.target.value
      const { error } = await supabase
        .from('properties')
        .update({ status: newStatus })
        .eq('id', property.id)

      if (!error && onUpdated) {
        const { data } = await supabase
          .from('properties')
          .select('*')
          .eq('id', property.id)
          .single()

        if (data) {
          onUpdated(data)
        }
      } else {
        alert('Ошибка при обновлении статуса')
      }
    }}
    className={`block w-[150px] h-10 font-daysone text-center mb-5 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2
      ${
        property.status === 'договор'
          ? 'bg-green-500 text-white'
          : property.status === 'подписание' || property.status === 'на встречу'
          ? 'bg-purple-500 text-white'
          : property.status === 'подождем' || property.status === 'не хочу'
          ? 'bg-yellow-400 text-gray-800'
          : ['слился', 'отказ', 'снят'].includes(property.status)
          ? 'bg-red-500 text-white'
          : property.status === 'продан'
          ? 'bg-orange-600 text-white'
          : 'bg-gray-100 text-gray-900'
      }
    `}
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
<div className="hs-dropdown relative inline-flex">
  <button id="hs-dropdown-default" type="button" className="hs-dropdown-toggle py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-700 dark:focus:bg-neutral-700" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">
    Actions
    <svg className="hs-dropdown-open:rotate-180 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  </button>

  <div className="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 hidden min-w-60 bg-white shadow-md rounded-lg mt-2 dark:bg-neutral-800 dark:border dark:border-neutral-700 dark:divide-neutral-700 after:h-4 after:absolute after:-bottom-4 after:start-0 after:w-full before:h-4 before:absolute before:-top-4 before:start-0 before:w-full" role="menu" aria-orientation="vertical" aria-labelledby="hs-dropdown-default">
    <div className="p-1 space-y-0.5">
      <a className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700" href="#">
        Newsletter
      </a>
      <a className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700" href="#">
        Purchases
      </a>
      <a className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700" href="#">
        Downloads
      </a>
      <a className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 dark:focus:bg-neutral-700" href="#">
        Team Account
      </a>
    </div>
  </div>
</div>
          <div className="flex items-center mt-4">
  <p className="mr-2">
    <strong>НО:</strong> {property.object_number || <span className="text-gray-400">Не указан</span>}
  </p>
  {/* Всплывающее уведомление */}
{notification && (
  <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg transition-opacity duration-300">
    {notification}
  </div>
)}
  <button
  onClick={() => {
    const text = property.object_number
    if (!text) {
      setNotification('Нет значения для копирования')
      setTimeout(() => setNotification(''), 2000)
      return
    }

    navigator.clipboard.writeText(text)
      .then(() => {
        setNotification('НО скопирован в буфер обмена')
        setTimeout(() => setNotification(''), 2000)
      })
      .catch(err => {
        console.error('Ошибка копирования:', err)
        setNotification('Ошибка копирования')
        setTimeout(() => setNotification(''), 2000)
      })
  }}
  className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
  title="Скопировать НО"
>
  📋
</button>
</div>
      <p><strong>Статус:</strong> {property.status}</p>
      <p><strong>Комментарий:</strong> {property.note}</p>

      <hr className="my-6" />



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
