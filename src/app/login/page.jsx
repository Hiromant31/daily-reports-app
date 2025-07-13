'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { data } from 'autoprefixer'
import rubik from '../fonts.ts'
import { DiffieHellman } from 'crypto'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('login')

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage('')
   
   const { data, error } = await supabase.auth.signInWithPassword({ email, password })

   if (error) {
    setMessage('error login')
   } else {
    setMessage('login OK')
    router.push('/') // перенаправление после входа
   }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setMessage('')

    const {data, error} = await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage('error register')
    } else {
      setMessage('register OK')
      router.push('/') // перенаправление после регистрации
    }
  }

  return (
    <div className='h-screen flex flex-col items-center justify-center'>
      <div className="mb-6">
        <svg className="mx-auto sm:mx-0" width="224" height="56" viewBox="0 0 112 28" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-dc18dd99=""><path d="M61.3805 0.344828C61.1068 0.344828 60.885 0.560968 60.885 0.827586V27.1034C60.885 27.3701 61.1068 27.5862 61.3805 27.5862H68.885C69.1587 27.5862 69.3805 27.3701 69.3805 27.1034V20.0642C69.3805 19.6043 69.9782 19.4049 70.2676 19.7682L76.198 27.2126C76.3857 27.4483 76.6748 27.5862 76.981 27.5862H85.466C85.8782 27.5862 86.1102 27.1247 85.8575 26.8075L75.661 14.0078C75.6412 13.9829 75.6412 13.9481 75.661 13.9232L85.8575 1.12355C86.1102 0.806371 85.8782 0.344828 85.466 0.344828H76.981C76.6748 0.344828 76.3857 0.482725 76.198 0.718413L70.2676 8.1628C69.9782 8.52615 69.3805 8.32676 69.3805 7.86683V0.827586C69.3805 0.560968 69.1587 0.344828 68.885 0.344828H61.3805Z" fill="red" data-v-dc18dd99=""></path><path fill-rule="evenodd" clip-rule="evenodd" d="M13.3097 0C17.479 0 18.9202 1.62779 20.177 3.18785V0.827586C20.177 0.560968 20.3989 0.344828 20.6726 0.344828H27.3982C27.6719 0.344828 27.8938 0.560968 27.8938 0.827586V27.1034C27.8938 27.3701 27.6719 27.5862 27.3982 27.5862H20.6726C20.3989 27.5862 20.177 27.3701 20.177 27.1034V24.7367C18.9618 26.1893 17.3979 27.931 13.3097 27.931C11.0536 27.931 8.59493 27.5702 6.44248 26.4138C2.81995 24.4675 0 20.5107 0 14C0 7.78208 2.46803 3.99251 5.55752 2C8.08779 0.368147 11.0466 0 13.3097 0ZM10.1947 9.44828C9.72549 9.44828 9.34513 9.8188 9.34513 10.2759V17.6552C9.34513 18.1122 9.72549 18.4828 10.1947 18.4828H16.5337C16.8639 18.4828 17.1724 18.3226 17.3565 18.0556L19.9648 14.2732C20.0931 14.0871 20.0931 13.8439 19.9648 13.6579L17.3565 9.8754C17.1724 9.60841 16.8639 9.44828 16.5337 9.44828H10.1947Z" fill="red" data-v-dc18dd99=""></path><path d="M111.979 10.151C111.359 7.59508 108.656 -5.08339e-06 98.4087 0C94.8753 1.75287e-06 92.2721 0.881814 90.3017 2.10604C82.4177 7.00439 82.431 21.0039 90.3017 25.894C92.2721 27.1182 94.8753 28 98.4087 28C108.656 28 111.359 20.4049 111.979 17.849C112.089 17.396 111.753 16.9826 111.278 16.9358L103.877 16.2065C103.669 16.186 103.467 16.2787 103.35 16.4478L102.241 18.0556C102.057 18.3226 101.749 18.4828 101.419 18.4828H94.5841C94.1149 18.4828 93.7345 18.1122 93.7345 17.6552V10.2759C93.7345 9.8188 94.1149 9.44828 94.5841 9.44828H101.419C101.749 9.44828 102.057 9.60842 102.241 9.8754L103.395 11.5478C103.511 11.7169 103.714 11.8096 103.922 11.7891L111.278 11.0642C111.753 11.0174 112.089 10.604 111.979 10.151Z" fill="red" data-v-dc18dd99=""></path><path fill-rule="evenodd" clip-rule="evenodd" d="M32.9204 4.65517C34.4908 2.06112 37.461 0.344828 41.1327 0.344828H55.7168C55.9905 0.344828 56.2124 0.560968 56.2124 0.827586V27.1034C56.2124 27.3701 55.9905 27.5862 55.7168 27.5862H48.9911C48.7174 27.5862 48.4956 27.3701 48.4956 27.1034V21.5172H46.1809L41.6427 27.2127C41.455 27.4483 41.166 27.5862 40.8598 27.5862H32.3748C31.9627 27.5862 31.7306 27.1246 31.9834 26.8074L36.8831 20.6582C35.325 19.9666 34.0437 18.8956 33.1521 17.5862C31.8793 15.7169 31.3628 13.3618 31.3628 10.931C31.3628 8.6908 31.8363 6.44582 32.9204 4.65517ZM41.5575 7.93103C41.0883 7.93103 40.708 8.30155 40.708 8.75862V13.1034C40.708 13.5605 41.0883 13.931 41.5575 13.931H47.5752C48.0444 13.931 48.4248 13.5605 48.4248 13.1034V8.75862C48.4248 8.30155 48.0444 7.93103 47.5752 7.93103H41.5575Z" fill="red" data-v-dc18dd99=""></path></svg>
      </div>
    <div className="max-w-md mx-auto p-4 border rounded shadow">
      <div className="relative flex justify-around mb-6">
  {['login', 'register'].map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`relative px-4 py-2 font-semibold transition-colors duration-300 ${
        activeTab === tab ? 'text-red-600' : 'text-gray-400'
      }`}
    >
      {tab === 'login' ? 'Вход' : 'Регистрация'}
      {activeTab === tab && (
        <motion.div
          layoutId="underline"
          className="absolute left-0 right-0 -bottom-1 h-0.5 bg-red-600 rounded"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  ))}
</div>

      <form onSubmit={activeTab === 'login' ? handleLogin : handleRegister} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="text-gray-500 w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="text-gray-500 w-full border px-3 py-2 rounded"
          required
        />
        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded w-full">
          {activeTab === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </button>
      </form>

      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
    </div>
    </div>
  )
}
