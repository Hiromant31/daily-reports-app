'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleRegister = async (e) => {
    e.preventDefault()
    setMessage('')

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Регистрация прошла, проверьте почту для подтверждения')
      // Можно перенаправить или предложить зайти
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-4 border rounded shadow">
      <h1 className="text-xl font-bold mb-4">Регистрация</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded w-full">
          Зарегистрироваться
        </button>
      </form>
      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
    </div>
  )
}
