"use client"

import { useMemo } from "react"
import type { HabitWithTodayStatus } from "@lifeboard/lib"
import type { JournalEntry, DayOfWeek } from "@lifeboard/types"

const DAYS_ORDER: DayOfWeek[] = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
]

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]

type Props = {
  weeklyStats: { total: number; completed: number }
  tasksByDay: Record<string, { total: number; completed: number }>
  habitsToday: HabitWithTodayStatus[]
  journalEntriesThisWeek: JournalEntry[]
  readingStreak: number
}

const WeeklyStatsCard = ({
  weeklyStats,
  tasksByDay,
  habitsToday,
  journalEntriesThisWeek,
  readingStreak,
}: Props) => {
  const maxDayTasks = useMemo(() => {
    return Math.max(
      ...DAYS_ORDER.map((d) => tasksByDay[d]?.total ?? 0),
      1
    )
  }, [tasksByDay])

  const habitConsistency = useMemo(() => {
    if (habitsToday.length === 0) return 0
    const totalCompleted = habitsToday.reduce(
      (sum, h) => sum + (h.completed_today ? 1 : 0),
      0
    )
    return Math.round((totalCompleted / habitsToday.length) * 100)
  }, [habitsToday])

  const journalDays = useMemo(() => {
    const days = new Set<number>()
    for (const entry of journalEntriesThisWeek) {
      const d = new Date(entry.created_at)
      const dayOfWeek = d.getDay()
      const mapped = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      days.add(mapped)
    }
    return days
  }, [journalEntriesThisWeek])

  const weekStart = useMemo(() => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const start = new Date(now)
    start.setDate(now.getDate() - diff)
    return start.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }, [])

  const weekEnd = useMemo(() => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
    const end = new Date(now)
    end.setDate(now.getDate() + diff)
    return end.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }, [])

  const strokeDasharray = 2 * Math.PI * 20
  const streakProgress = Math.min(readingStreak / 30, 1)

  return (
    <div
      className="relative rounded-2xl p-4 md:p-5 lg:p-6 transition-all duration-200"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)" }}>
        <h3 className="font-semibold text-white">This Week</h3>
        <span className="text-xs text-white/30">
          {weekStart} &ndash; {weekEnd}
        </span>
      </div>

      {/* 4 stat blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tasks */}
        <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}>
          <p className="font-mono text-2xl font-bold text-white">
            {weeklyStats.completed}
          </p>
          <p className="text-xs text-white/40 mb-3">
            of {weeklyStats.total} tasks
          </p>
          <div className="flex items-end gap-1 h-8">
            {DAYS_ORDER.map((day, i) => {
              const dayData = tasksByDay[day] ?? { total: 0, completed: 0 }
              const height =
                dayData.total > 0
                  ? Math.max((dayData.completed / maxDayTasks) * 100, 8)
                  : 4
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-sm transition-all duration-500"
                    style={{
                      height: `${height}%`,
                      backgroundColor:
                        dayData.completed > 0
                          ? "#6C47FF"
                          : "rgba(255,255,255,0.05)",
                    }}
                  />
                  <span className="text-[9px] text-white/20">
                    {DAY_LABELS[i]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Habits */}
        <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}>
          <p className="font-mono text-2xl font-bold text-white">{habitConsistency}%</p>
          <p className="text-xs text-white/40 mb-3">consistency today</p>
          <div className="flex items-center gap-1.5">
            {habitsToday.slice(0, 7).map((habit) => (
              <div
                key={habit.id}
                className={`w-3 h-3 rounded-full ${
                  habit.completed_today
                    ? "bg-[#6C47FF]"
                    : "bg-white/10"
                }`}
              />
            ))}
            {habitsToday.length > 7 && (
              <span className="text-[9px] text-white/20">
                +{habitsToday.length - 7}
              </span>
            )}
          </div>
        </div>

        {/* Journal */}
        <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}>
          <p className="font-mono text-2xl font-bold text-white">
            {journalEntriesThisWeek.length}
          </p>
          <p className="text-xs text-white/40 mb-3">entries this week</p>
          <div className="flex items-center gap-1.5">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-3 h-3 rounded-full ${
                    journalDays.has(i)
                      ? "bg-[#22C55E]"
                      : "bg-white/10"
                  }`}
                />
                <span className="text-[9px] text-white/20">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reading */}
        <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}>
          <p className="font-mono text-2xl font-bold text-white">{readingStreak}</p>
          <p className="text-xs text-white/40 mb-3">day reading streak</p>
          <div className="flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="3"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={
                  strokeDasharray - strokeDasharray * streakProgress
                }
                transform="rotate(-90 24 24)"
                className="transition-all duration-700"
              />
              <text
                x="24"
                y="26"
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
              >
                📖
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeeklyStatsCard
