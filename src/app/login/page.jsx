'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Успешный вход')
      router.push('/') // перенаправление после входа
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-4 border rounded shadow">
      <h1 className="text-xl font-bold mb-4">Вход</h1>
      <form onSubmit={handleLogin} className="space-y-4">
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
          Войти
        </button>
      </form>
      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
    </div>
  )
}
