"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Bell,
  Map,
  Flame,
  Library,
  Settings,
} from "lucide-react"
import NotificationBell from "@/components/modules/reminders/NotificationBell"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/planner", label: "Planner", icon: Map },
  { href: "/habits", label: "Habits", icon: Flame },
  { href: "/library", label: "Library", icon: Library },
]

const Sidebar = () => {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-full bg-[#13131F] border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            <span className="text-[#6C47FF]">Life</span>board
          </h1>
          <p className="text-xs text-white/40 mt-0.5">Your Personal Life OS</p>
        </div>
        <NotificationBell />
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#6C47FF] text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-white/5">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings size={18} />
          Settings
        </Link>
      </div>
    </aside>
  )
}

export default Sidebar
