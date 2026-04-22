"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import useRemindersHook from "@/lib/hooks/useReminders"
import useNotifications from "@/lib/hooks/useNotifications"
import { Bell, Cake, Heart, BellRing } from "lucide-react"
import type { ReminderType } from "@lifeboard/types"

const useUser = () => {
  const supabase = createClient()
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      return user
    },
  })
}

const TYPE_ICONS: Record<ReminderType, typeof Bell> = {
  birthday: Cake,
  health: Heart,
  custom: Bell,
}

const TYPE_COLORS: Record<ReminderType, string> = {
  birthday: "text-pink-400",
  health: "text-blue-400",
  custom: "text-[#6C47FF]",
}

const getRelativeTime = (isoDate: string): string => {
  const diff = new Date(isoDate).getTime() - Date.now()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days > 1) return `in ${days} days`
  if (days === 1) return "tomorrow"
  if (hours > 0) return `in ${hours}h`
  if (minutes > 0) return `in ${minutes}m`
  return "now"
}

const NotificationBell = () => {
  const { data: user } = useUser()
  const { upcomingReminders, upcomingCount, toggleActive } = useRemindersHook(
    user?.id ?? ""
  )
  const { permission, requestPermission, isSupported } =
    useNotifications(upcomingReminders)

  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  if (!user) return null

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
      >
        <Bell size={18} />
        {upcomingCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
            {upcomingCount > 9 ? "9+" : upcomingCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-80 rounded-xl z-50" style={{ background: "rgba(15,12,30,0.85)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", boxShadow: "0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
          {/* Header */}
          <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h3 className="text-sm font-semibold text-white">Upcoming Reminders</h3>
          </div>

          {/* Notification permission prompt */}
          {isSupported && permission !== "granted" && (
            <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(108,71,255,0.05)" }}>
              <div className="flex items-center gap-2 mb-1.5">
                <BellRing size={14} className="text-[#6C47FF]" />
                <span className="text-xs text-white/60">Get browser notifications</span>
              </div>
              <button
                onClick={requestPermission}
                className="text-xs text-[#6C47FF] hover:text-[#5835FF] font-medium transition-colors"
              >
                Enable notifications
              </button>
            </div>
          )}

          {/* Reminders list */}
          <div className="max-h-64 overflow-y-auto">
            {upcomingReminders.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-white/30 text-sm">No upcoming reminders</p>
              </div>
            ) : (
              upcomingReminders.slice(0, 5).map((reminder) => {
                const Icon = TYPE_ICONS[reminder.type]
                const color = TYPE_COLORS[reminder.type]
                return (
                  <div
                    key={reminder.id}
                    className="px-4 py-3 hover:bg-white/5 transition-colors flex items-start gap-3"
                  >
                    <div className={`mt-0.5 ${color}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{reminder.title}</p>
                      <p className="text-xs text-white/30 mt-0.5">
                        {getRelativeTime(reminder.trigger_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleActive(reminder.id, false)}
                      className="text-[10px] text-white/30 hover:text-white/60 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0"
                    >
                      Done
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <Link
              href="/reminders"
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#6C47FF] hover:text-[#5835FF] font-medium transition-colors"
            >
              View all reminders
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
