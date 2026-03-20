"use client"

import { useMemo } from "react"
import Link from "next/link"
import type { HabitWithTodayStatus } from "@lifeboard/lib"

const CATEGORY_EMOJIS: Record<string, string> = {
  health: "💪",
  fitness: "🏃",
  learning: "📖",
  mindfulness: "🧘",
  social: "👥",
  finance: "💰",
  custom: "⭐",
}

const CONFETTI_COLORS = ["#6C47FF", "#F97316", "#22C55E", "#EC4899", "#3B82F6", "#F59E0B"]

type Props = {
  habitsToday: HabitWithTodayStatus[]
  habitProgress: { total: number; completed: number }
  logHabit: (habitId: string) => void
  unlogHabit: (habitId: string) => void
  longestHabitStreak: number
  allCompleted: boolean
}

const HabitsCard = ({
  habitsToday,
  habitProgress,
  logHabit,
  unlogHabit,
  longestHabitStreak,
  allCompleted,
}: Props) => {
  const streakMilestone = useMemo(() => {
    const milestones = [100, 30, 7]
    for (const habit of habitsToday) {
      for (const m of milestones) {
        if (habit.current_streak === m) {
          return { days: m, name: habit.name }
        }
      }
    }
    return null
  }, [habitsToday])

  return (
    <div className="relative bg-[#13131F] rounded-2xl border border-white/[0.06] border-l-[3px] border-l-[#F97316] p-6 h-full hover:border-[#F97316]/30 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)] hover:scale-[1.01] transition-all duration-200 group overflow-hidden">
      {/* Floating icon */}
      <span className="absolute top-4 right-4 text-lg opacity-60 animate-float-flicker">
        🔥
      </span>

      {/* Confetti when all done */}
      {allCompleted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full animate-confetti-fall"
              style={{
                left: `${8 + (i * 7.5)}%`,
                top: "-4px",
                backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
        <h3 className="font-semibold text-white">Habits</h3>
        {longestHabitStreak > 0 && (
          <span className="text-xs bg-[#F97316]/15 text-[#F97316] rounded-full px-2.5 py-0.5 font-medium">
            🔥 {longestHabitStreak} day streak
          </span>
        )}
      </div>

      {/* Streak milestone */}
      {streakMilestone && (
        <div className="bg-[#F97316]/10 border border-[#F97316]/20 rounded-lg px-3 py-2 mb-3 text-xs text-[#F97316]">
          🎉 {streakMilestone.days} day streak on {streakMilestone.name}!
        </div>
      )}

      {/* All done celebration */}
      {allCompleted && habitsToday.length > 0 && (
        <div className="text-center py-2 mb-3">
          <p className="text-sm font-medium text-white">All done for today! 🎉</p>
        </div>
      )}

      {/* Habit list */}
      {habitsToday.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-white/30">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3 text-2xl">
            🔥
          </div>
          <p className="text-sm font-medium mb-1">No habits yet</p>
          <Link href="/habits" className="text-xs text-[#F97316] hover:underline">
            Start tracking habits &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-1 max-h-[240px] overflow-y-auto">
          {habitsToday.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center gap-3 py-1.5 px-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className="text-sm flex-shrink-0">
                {CATEGORY_EMOJIS[habit.category] ?? "⭐"}
              </span>
              <span
                className={`text-sm flex-1 truncate ${
                  habit.completed_today ? "text-white/40" : "text-white"
                }`}
              >
                {habit.name}
              </span>
              <button
                onClick={() =>
                  habit.completed_today
                    ? unlogHabit(habit.id)
                    : logHabit(habit.id)
                }
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  habit.completed_today
                    ? "bg-[#6C47FF] text-white"
                    : "border border-white/20 hover:border-[#6C47FF] text-transparent hover:text-white/20"
                }`}
              >
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path
                    d="M1 5L4.5 8.5L11 1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Progress */}
      {habitsToday.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-white/40">
              {habitProgress.completed} of {habitProgress.total}
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${
                  habitProgress.total > 0
                    ? Math.round(
                        (habitProgress.completed / habitProgress.total) * 100
                      )
                    : 0
                }%`,
                backgroundColor:
                  habitProgress.completed === habitProgress.total
                    ? "#22C55E"
                    : "#F97316",
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default HabitsCard
