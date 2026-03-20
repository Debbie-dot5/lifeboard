"use client"

import { useState } from "react"
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
  PanelLeftClose,
  PanelLeftOpen,
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
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-64"} h-full bg-[#13131F] border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Logo */}
      <div className={`${collapsed ? "p-4 justify-center" : "p-6 justify-between"} border-b border-white/5 flex items-center`}>
        {collapsed ? (
          <span className="text-xl font-bold text-[#6C47FF]">L</span>
        ) : (
          <>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                <span className="text-[#6C47FF]">Life</span>board
              </h1>
              <p className="text-xs text-white/40 mt-0.5">Your Personal Life OS</p>
            </div>
            <NotificationBell />
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#6C47FF] text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={18} />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all w-full`}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <Link
          href="/settings"
          title={collapsed ? "Settings" : undefined}
          className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all`}
        >
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  )
}

export default Sidebar
