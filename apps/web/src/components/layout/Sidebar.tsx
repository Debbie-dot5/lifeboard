"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
  LogOut,
  Menu,
  X,
} from "lucide-react"
import NotificationBell from "@/components/modules/reminders/NotificationBell"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/planner", label: "Planner", icon: Map },
  { href: "/habits", label: "Habits", icon: Flame },
  { href: "/library", label: "Library", icon: Library },
]

const Sidebar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w >= 768 && w < 1024) setCollapsed(true)
      else if (w >= 1024) setCollapsed((prev) => (prev === true ? false : prev))
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const glassStyle = {
    background: "rgba(10, 8, 20, 0.7)",
    backdropFilter: "blur(40px)",
    WebkitBackdropFilter: "blur(40px)",
    border: "1px solid rgba(255,255,255,0.08)",
  } as const

  return (
    <>
      {/* Mobile hamburger */}
      {!sidebarOpen && (
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden flex items-center justify-center w-11 h-11 rounded-lg text-white/80 hover:text-white safe-top"
          style={glassStyle}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[90] lg:hidden"
          style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-[100] lg:z-auto ${
          collapsed ? "lg:w-16" : "lg:w-64"
        } w-[280px] md:w-16 h-full flex flex-col transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
        style={{
          ...glassStyle,
          borderRight: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "inset -1px 0 0 rgba(255,255,255,0.05), 4px 0 24px rgba(0,0,0,0.3)",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Logo */}
        <div
          className={`${collapsed ? "p-4 justify-center" : "p-6 justify-between"} flex items-center relative`}
          style={{
            background: "rgba(108,71,255,0.08)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {collapsed ? (
            <span
              className="text-xl font-bold text-[#6C47FF]"
              style={{ fontFamily: "var(--font-clash)", fontWeight: 700, letterSpacing: "-0.04em" }}
            >
              L
            </span>
          ) : (
            <>
              <div>
                <h1
                  className="text-xl font-bold text-white tracking-tight"
                  style={{ fontFamily: "var(--font-clash)", fontWeight: 700, letterSpacing: "-0.04em" }}
                >
                  <span className="text-[#6C47FF]">Life</span>board
                </h1>
                <p className="text-xs text-white/40 mt-0.5">Your Personal Life OS</p>
              </div>
              <NotificationBell />
            </>
          )}
          {/* Mobile close button */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
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
                className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-h-11`}
                style={
                  isActive
                    ? {
                        background: "rgba(108, 71, 255, 0.2)",
                        border: "1px solid rgba(108, 71, 255, 0.3)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 0 20px rgba(108,71,255,0.15)",
                        color: "#fff",
                      }
                    : {
                        border: "1px solid transparent",
                        color: "rgba(255,255,255,0.5)",
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)"
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
                    e.currentTarget.style.color = "#fff"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent"
                    e.currentTarget.style.borderColor = "transparent"
                    e.currentTarget.style.color = "rgba(255,255,255,0.5)"
                  }
                }}
              >
                <Icon size={18} />
                {!collapsed && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 space-y-1 safe-bottom" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`hidden lg:flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all w-full min-h-11`}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            {!collapsed && <span>Collapse</span>}
          </button>
          <Link
            href="/settings"
            title={collapsed ? "Settings" : undefined}
            className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all min-h-11`}
          >
            <Settings size={18} />
            {!collapsed && <span>Settings</span>}
          </Link>

          {/* Separator + Logout */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "4px", marginTop: "4px" }}>
            <button
              onClick={handleLogout}
              title={collapsed ? "Log out" : undefined}
              className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all w-full min-h-11`}
            >
              <LogOut size={18} />
              {!collapsed && <span>Log out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
