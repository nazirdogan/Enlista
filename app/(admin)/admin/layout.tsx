import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f4f5f7]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div style={{ animation: 'fadeSlideIn 150ms ease-out' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
