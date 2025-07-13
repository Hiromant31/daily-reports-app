import React, { useMemo, useState, useRef, useEffect } from 'react'

function splitDateRange(fromDate, toDate, parts) {
  const start = new Date(fromDate)
  const end = new Date(toDate)
  const msRange = end.getTime() - start.getTime()
  const msStep = msRange / parts

  const boundaries = []
  for (let i = 0; i <= parts; i++) {
    boundaries.push(new Date(start.getTime() + msStep * i))
  }
  return boundaries
}

function isDateInRange(dateStr, start, end) {
  const d = new Date(dateStr).getTime()
  return d >= start.getTime() && d < end.getTime()
}

function getSmoothPath(points) {
  if (points.length < 2) return ''

  let d = `M${points[0].x},${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1]

    // контрольные точки для кривой Безье
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6

    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
  }

  return d
}

export default function ActivityChart({ reports, fromDate, toDate, activeTab }) {
  const parts = 7

  const boundaries = useMemo(() => splitDateRange(fromDate, toDate, parts), [fromDate, toDate])

const bins = useMemo(() => {
  const result = Array(parts).fill(0)
  const key = activeTab === 'seller' ? 'calls_sellers' : 'calls_buyers'

  for (const report of reports) {
    for (let i = 0; i < parts; i++) {
      if (isDateInRange(report.date, boundaries[i], boundaries[i + 1])) {
        result[i] += report[key] || 0
        break
      }
    }
  }
  return result
}, [reports, boundaries, activeTab])


  const maxVal = Math.max(...bins, 1)

  const width = 400 // для viewBox, svg масштабируется
  const height = 100
  const padding = 30

  const stepX = (width - 2 * padding) / (parts - 1)

  const points = bins.map((val, i) => {
    const x = padding + i * stepX
    const y = height - padding - (val / maxVal) * (height - 2 * padding)
    return { x, y }
  })

  const pathD = getSmoothPath(points)

  const containerRef = useRef(null)
  const [tooltip, setTooltip] = useState(null) // { x, y, value }

  // функция для позиционирования tooltip
  const showTooltip = (pointIndex) => {
    if (!containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    // Пропорциональная позиция точки внутри SVG viewBox
    const svgX = points[pointIndex].x
    const svgY = points[pointIndex].y

    // Координаты в px относительно контейнера
    const x = (svgX / width) * containerRect.width
    const y = (svgY / height) * containerRect.height

    // Ограничиваем tooltip, чтобы не выходил за края контейнера
    const tooltipWidth = 60 // px, примерный размер tooltip
    let left = x - tooltipWidth / 2
    if (left < 0) left = 0
    if (left + tooltipWidth > containerRect.width) left = containerRect.width - tooltipWidth

    setTooltip({ x: left, y: y - 35, value: bins[pointIndex] })
  }

  const hideTooltip = () => {
    setTooltip(null)
  }

  return (
    <div
      ref={containerRef}
      className="p-4 bg-gray-50 rounded shadow w-full mx-auto relative"
      style={{ userSelect: 'none' }}
    >
      <h4 className="font-semibold mb-2">График активности</h4>

      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="bg-white border rounded"
      >
        {points.map((point, i) => {
          const barHeight = height - padding - point.y
          return (
            <rect
              key={i}
              x={point.x - stepX / 4}
              y={point.y}
              width={stepX / 2}
              height={barHeight}
              fill="#f19196"
              rx={2}
              ry={2}
              onMouseEnter={() => showTooltip(i)}
              onMouseLeave={hideTooltip}
            />
          )
        })}

        <path d={pathD} fill="none" stroke="#E53740" strokeWidth={2} />

        {points.map((point, i) => (
          <circle key={i} cx={point.x} cy={point.y} r={4} fill="#E53740" />
        ))}

        {boundaries.slice(0, parts).map((date, i) => {
          const x = padding + i * stepX
          return (
            <text
              key={i}
              x={x}
              y={height - 8}
              fontSize="10"
              fill="#6B7280"
              textAnchor="middle"
              pointerEvents="none"
            >
              {date.toISOString().slice(5, 10).replace('-', '.')}
            </text>
          )
        })}
      </svg>

      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            width: 60,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '4px 6px',
            borderRadius: 4,
            fontSize: 12,
            textAlign: 'center',
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            transform: 'translateY(0)',
            transition: 'opacity 0.2s ease',
            zIndex: 10,
          }}
        >
          {tooltip.value}
        </div>
      )}
    </div>
  )
}
