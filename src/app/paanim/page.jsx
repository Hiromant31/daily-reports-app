'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

function getRandomLeft() {
  return Math.floor(Math.random() * 60) + '%' // До 60% ширины
}

export default function FolderCabinet() {
  const [activeId, setActiveId] = useState(null)

  const folders = useMemo(() => [
    { id: 4, title: 'Ольга Соколова', subtitle: 'Кадровое', tagLeft: getRandomLeft() },
    { id: 3, title: 'Алексей Смирнов', subtitle: 'Дело №142', tagLeft: getRandomLeft() },
    { id: 2, title: 'Мария Иванова', subtitle: 'Пациент', tagLeft: getRandomLeft() },
    { id: 1, title: 'Иван Петров', subtitle: 'Личное дело', tagLeft: getRandomLeft() },
  ], [])

  return (
    <div className="min-h-screen bg-[#f3f1ec] p-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8">🗂️ 3D Картотека</h1>

      <div
        className="relative w-[300px] h-[300px] border rounded-lg"
        style={{
          perspective: '800px',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className="w-full h-full relative"
          style={{
            transform: 'rotateX(-25deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {folders.map((folder) => {
            const isActive = activeId === folder.id

            return (
              <motion.div
                key={folder.id}
                className="absolute left-0 right-0 mx-auto w-[240px] h-[120px] bg-yellow-100 border border-yellow-300 rounded-sm shadow-md"
                style={{
                  top: folder.id * 30,
                  transform: `translateZ(${folder.id * 10}px)`,
                  zIndex: folder.id,
                }}
                animate={{
                  y: isActive ? -35 : 0,
                  transition: { type: 'spring', stiffness: 300, damping: 25 },
                }}
              >
                {/* Ярлык */}
                <div
                  className="absolute top-[-12px] h-[24px] px-2 bg-yellow-300 text-xs font-semibold border border-yellow-400 shadow-sm cursor-pointer select-none"
                  style={{
                    width: '40%',
                    left: folder.tagLeft,
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                  }}
                  onClick={() => setActiveId(folder.id === activeId ? null : folder.id)}
                >
                  {folder.title}
                </div>

                {isActive && (
                  <div className="pt-6 px-3 text-[12px] text-gray-700">{folder.subtitle}</div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
