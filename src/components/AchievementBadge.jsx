'use client'

import { useEffect, useState } from 'react'

export default function AchievementBadge({ reports }) {
  const [badges, setBadges] = useState([])

  useEffect(() => {
    if (!reports || reports.length === 0) return

    // Получаем 7 последних дней
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentReports = reports.filter(report => new Date(report.date) >= sevenDaysAgo)

    let totalCallsSellers = 0
    let totalStickers = 0

    for (const report of recentReports) {
      totalCallsSellers += report.calls_sellers || 0
      totalStickers += report.stickers || 0
    }

    const earnedBadges = []

    // Бейджи по звонкам продавцам
    if (totalCallsSellers >= 120) {
      earnedBadges.push({
        label: '🏆 Колл-центр Машина',
        image: 'IMG_7689.JPG', // Укажите путь к картинке
      })
    } else if (totalCallsSellers >= 80) {
      earnedBadges.push({
        label: '📞 Гроза Продавцов',
        image: '/images/seller-storm.png', // Укажите путь к картинке
      })
    }

    // Бейджи по расклейке
    if (totalStickers >= 2000) {
      earnedBadges.push({
        label: '🎭 Клею даже на Лица',
        image: 'IMG_7688.JPG', // Укажите путь к картинке
      })
    } else if (totalStickers >= 1500) {
      earnedBadges.push({
        label: '🏙️ Заклеил весь Город',
        image: '/images/city-sticker.png', // Укажите путь к картинке
      })
    } else if (totalStickers >= 1000) {
      earnedBadges.push({
        label: '🧾 Мистер Расклейщик',
        image: '/images/mister-sticker.png', // Укажите путь к картинке
      })
    }

    setBadges(earnedBadges)
  }, [reports])

  if (badges.length === 0) return null

  return (
    <div className="bg-red-50 border border-red-300 p-4 rounded mb-4">
  <h4 className="font-semibold mb-2 text-red-800">Достижения за неделю:</h4>
  <div className="flex overflow-x-auto space-x-2 pb-2">
    {badges.map((badge, index) => (
      <div
        key={index}
        className="relative w-32 h-32 flex-shrink-0"
        title={badge.label}
      >
        <img
          src={badge.image}
          alt={badge.label}
          className="w-full h-full object-cover rounded-t-lg"
        />
        <span className="absolute bottom-0 left-0 right-0 bg-red-50 bg-opacity-90 text-xs font-semibold text-red-800 text-center py-0.5 whitespace-normal break-words">
          {badge.label}
        </span>
      </div>
    ))}
  </div>
</div>
  )
}
