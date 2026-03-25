'use client'
import { useState } from 'react'

interface ChartModalProps {
  title: string
  children: React.ReactNode
  expandedContent?: React.ReactNode
}

export function ChartModal({ title, children, expandedContent }: ChartModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(true)}
        className="absolute top-0 right-0 text-gray-300 hover:text-gray-600 text-xs z-10 p-1"
        title="Expand chart"
      >
        ⛶
      </button>
      {children}

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-gray-900">{title}</div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700 text-lg leading-none">×</button>
            </div>
            {expandedContent ?? children}
          </div>
        </div>
      )}
    </div>
  )
}
