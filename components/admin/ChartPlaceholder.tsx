// Phase 2: fixed-height placeholder. Swapped for Recharts chart in Phase 4.
interface ChartPlaceholderProps {
  height?: number
  label?: string
}

export function ChartPlaceholder({ height = 140, label = 'Chart loading...' }: ChartPlaceholderProps) {
  return (
    <div
      className="w-full rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs"
      style={{ height }}
    >
      {label}
    </div>
  )
}
