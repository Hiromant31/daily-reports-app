// app/fonts.ts
import { Rubik } from 'next/font/google'

const rubik = Rubik({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-rubik',
  weight: ['400', '500', '700'],
})

export default rubik
