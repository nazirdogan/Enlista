'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Overview', icon: '📊', section: 'main' },
  { href: '/admin/users', label: 'Users', icon: '👥', section: 'main' },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: '💳', section: 'main' },
  { href: '/admin/listings', label: 'Listings', icon: '🏠', section: 'main' },
  { href: '/admin/outreach', label: 'Outreach', icon: '📱', section: 'growth' },
  { href: '/admin/emails', label: 'Emails', icon: '✉️', section: 'growth' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <aside className="w-[200px] bg-[#1a1a2e] flex flex-col shrink-0 h-screen sticky top-0">
      <div className="px-4 py-5 border-b border-white/10">
        <Link href="/dashboard" className="text-white text-sm font-bold hover:text-white/80 transition-colors">Enlista</Link>
        <div className="text-white/35 text-[10px] uppercase tracking-widest mt-0.5">Admin CRM</div>
      </div>
      <nav className="flex-1 py-3">
        {['main', 'growth'].map((section) => (
          <div key={section}>
            <div className="px-4 py-2 text-white/20 text-[9px] uppercase tracking-widest">
              {section}
            </div>
            {NAV.filter((n) => n.section === section).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 text-xs border-l-[3px] transition-all duration-200 ${
                  isActive(item.href)
                    ? 'text-white bg-indigo-500/15 border-indigo-400'
                    : 'text-white/55 border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-sm w-[18px] text-center">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}
