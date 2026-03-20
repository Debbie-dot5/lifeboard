"use client"

import { useMemo } from "react"
import Link from "next/link"
import type { Reminder } from "@lifeboard/types"

const TYPE_CONFIG: Record<string, { emoji: string; color: string }> = {
  birthday: { emoji: "🎂", color: "#EC4899" },
  health: { emoji: "💊", color: "#22C55E" },
  custom: { emoji: "⏰", color: "#6C47FF" },
}

const getRelativeTime = (triggerAt: string): string => {
  const now = new Date()
  const target = new Date(triggerAt)
  const diffMs = target.getTime() - now.getTime()

  if (diffMs < 0) return "overdue"

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return "in less than 1 hour"
  if (diffHours < 24) return `in ${diffHours} hour${diffHours > 1 ? "s" : ""}`
  if (diffDays === 1) return "tomorrow"
  if (diffDays < 7) return `in ${diffDays} days`
  return `in ${Math.ceil(diffDays / 7)} week${diffDays > 7 ? "s" : ""}`
}

type Props = {
  reminders: Reminder[]
}

const RemindersCard = ({ reminders }: Props) => {
  const hasDueSoon = useMemo(() => {
    const oneHour = 1000 * 60 * 60
    return reminders.some(
      (r) => new Date(r.trigger_at).getTime() - Date.now() < oneHour
    )
  }, [reminders])

  return (
    <div className="relative bg-[#13131F] rounded-2xl border border-white/[0.06] border-l-[3px] border-l-[#EC4899] p-6 h-full hover:border-[#EC4899]/30 hover:shadow-[0_0_30px_rgba(236,72,153,0.1)] hover:scale-[1.01] transition-all duration-200 group">
      {/* Floating icon */}
      <span className="absolute top-4 right-4 text-lg opacity-60 animate-float-swing">
        🔔
      </span>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">Reminders</h3>
          {hasDueSoon && (
            <span className="w-2 h-2 rounded-full bg-[#EC4899] animate-pulse" />
          )}
        </div>
        <Link
          href="/reminders"
          className="text-xs text-white/40 hover:text-[#EC4899] transition-colors"
        >
          View all &rarr;
        </Link>
      </div>

      {/* Reminder list */}
      {reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-white/30">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3 text-2xl">
            👌
          </div>
          <p className="text-sm font-medium">No reminders coming up</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => {
            const config = TYPE_CONFIG[reminder.type] ?? TYPE_CONFIG.custom
            return (
              <div
                key={reminder.id}
                className="flex items-start gap-3 py-1"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: config.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm flex-shrink-0">{config.emoji}</span>
                    <span className="text-sm text-white truncate">
                      {reminder.title}
                    </span>
                  </div>
                  <p className="text-xs text-white/30 mt-0.5">
                    {getRelativeTime(reminder.trigger_at)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default RemindersCard
