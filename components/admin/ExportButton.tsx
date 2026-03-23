'use client'
interface ExportButtonProps {
  section: string
  params?: Record<string, string>
}

export function ExportButton({ section, params = {} }: ExportButtonProps) {
  const handleExport = () => {
    const qs = new URLSearchParams(params).toString()
    window.location.href = `/api/admin/export/${section}${qs ? `?${qs}` : ''}`
  }

  return (
    <button
      onClick={handleExport}
      className="ml-auto bg-[#1a1a2e] text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
    >
      ⬇ Export CSV
    </button>
  )
}
