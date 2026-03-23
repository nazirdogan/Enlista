'use client'
import { useEffect, useRef } from 'react'

interface KpiCardProps {
  label: string
  value: string
  delta?: string
  deltaType?: 'up' | 'down' | 'neutral'
}

export function KpiCard({ label, value, delta, deltaType = 'neutral' }: KpiCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    el.style.opacity = '0'
    el.style.transform = 'translateY(8px)'
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 150ms ease-out, transform 150ms ease-out'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    })
  }, [])

  const deltaColors = { up: 'text-emerald-500', down: 'text-red-500', neutral: 'text-amber-500' }

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-xl p-4 border border-gray-200 cursor-default transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">{label}</div>
      <div className="text-2xl font-bold text-gray-900 leading-none mb-1.5">{value}</div>
      {delta && <div className={`text-[11px] ${deltaColors[deltaType]}`}>{delta}</div>}
    </div>
  )
}
