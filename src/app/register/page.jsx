'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { data } from 'autoprefixer'
import { Rubik } from 'next/font/google'
import styles from './RegisterPage.module.css'
import { DiffieHellman } from 'crypto'

  const rubik = Rubik({
    subsets: ['latin']
  })

export default function RegisterPage() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('login')

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage('')

    
    //  setMessage(err//const { data, error } = await supabase.auth.signUp({ email, password })

    //if (error) {or.message)
    //} else {
     // setMessage('Регистрация прошла, проверьте почту для подтверждения')
      // Можно перенаправить или предложить зайти
    //}


    //let { data, error } = await supabase.auth.signInWithPassword({ email, password })

   // if (error) {

      //const signUpResult = await supabase.auth.signUp({ email, password })

     // if (signUpResult.error) {
     //   setMessage('Register Error:')
    //  } else {
      //  setMessage('Register OK:')
     //   router.push('/') // перенаправление после регистрации
    //  }
   // } else {
   //   setMessage('SignIn OK:')
   //   router.push('/') // перенаправление после регистрации
   
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
    <div className='h-screen z-1 bg-auto bg-center bg-[url(/front_login.png)] flex flex-col items-center justify-center'>
       <div className=' backdrop-blur-md bg-white/50 flex flex-col w-[300px] h-[270px] p-[20px] rounded-[25px]'>
        {['login', 'register'].map((tab) => (
          <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`relative text-[14px] justify-end m-auto mr-0 font-comfortaa transition-colors duration-300 ${
            activeTab === tab ? 'text-[#e53740]' : 'text-[#696969]'
          }`}
          >
            {tab === 'login' ? 'ВХОД' : 'РЕГИСТРАЦИЯ'}
            {activeTab === tab && (
              <motion.div
              layoutId="underline"
              className="absolute left-0 right-0 -bottom-1 h-2 bg-[#e53740] rounded"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
              )}
              </button>
            ))}
      <div className=""> 
        <span className='font-daysone text-[48px]'>АЯКС</span>
      </div>
    <div className="">
      <div className="relative flex justify-around">
  
</div>

      <form onSubmit={activeTab === 'login' ? handleLogin : handleRegister} className="mt-0 z-2 space-y-2">
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full font-comfortaa rounded-full placeholder:text-[#696969] placeholder:font-comfortaa placeholder:p-4 backdrop-blur-md w-[250px] h-[32px] rounded"
          required
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full font-comfortaa rounded-full placeholder:text-[#696969] placeholder:font-comfortaa placeholder:p-4 backdrop-blur-md w-[250px] h-[32px] rounded"
          required
        />
        <button type="submit" className="text-[#fff] text-[14px] rounded-full bg-[#e53740] font-comfortaa w-[250px] h-[32px] rounded">
          {activeTab === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </button>
      </form>

      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
    </div>
    </div>
    </div>
  )
}
