"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import useHabitsHook from "@/lib/hooks/useHabits"
import useHabitDetailHook from "@/lib/hooks/useHabitDetail"
import HabitHeatmap from "@/components/habits/HabitHeatmap"
import AddHabitModal from "@/components/habits/AddHabitModal"
import { CATEGORY_CONFIG } from "@/components/habits/constants"
import { ArrowLeft, ChevronLeft, ChevronRight, Flame, Trophy, Target, CheckCircle } from "lucide-react"
import type { Habit } from "@lifeboard/types"

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

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const HabitDetailPage = () => {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { data: user } = useUser()
  const habitId = params.id

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showModal, setShowModal] = useState(false)

  const {
    habits,
    logHabit,
    unlogHabit,
    updateHabit,
    archiveHabit,
    deleteHabit,
    isUpdating,
  } = useHabitsHook(user?.id ?? "")

  const {
    logDates,
    currentStreak,
    longestStreak,
    completionRate,
    totalCheckIns,
    isLoading,
  } = useHabitDetailHook(user?.id ?? "", habitId)

  const habit = habits.find((h) => h.id === habitId)
  const config = habit ? CATEGORY_CONFIG[habit.category] : null

  // Monthly breakdown for the selected year
  const monthlyBreakdown = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthStr = String(i + 1).padStart(2, "0")
      const yearMonth = `${selectedYear}-${monthStr}`
      const daysInMonth = new Date(selectedYear, i + 1, 0).getDate()
      const today = new Date()
      const isCurrentMonth =
        selectedYear === today.getFullYear() && i === today.getMonth()
      const totalDays = isCurrentMonth ? today.getDate() : daysInMonth
      const logged = logDates.filter((d) => d.startsWith(yearMonth)).length

      return {
        name: MONTH_NAMES[i],
        logged,
        total: totalDays,
        rate: totalDays > 0 ? Math.round((logged / totalDays) * 100) : 0,
      }
    })
  }, [logDates, selectedYear])

  const handleDelete = () => {
    deleteHabit(habitId)
    router.push("/habits")
  }

  if (isLoading || !habit) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#6C47FF] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Back button */}
      <button
        onClick={() => router.push("/habits")}
        className="flex items-center gap-1.5 text-white/40 hover:text-white/60 text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Habits
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{habit.name}</h1>
          <div className="flex items-center gap-2">
            {config && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${config.color}15`, color: config.color }}
              >
                {config.emoji} {config.label}
              </span>
            )}
            <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/30 text-[10px] font-medium">
              {habit.frequency === "daily" ? "Daily" : "Weekly"}
            </span>
            {habit.is_archived && (
              <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/30 text-[10px] font-medium">
                Archived
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Check-in button */}
          {!habit.is_archived && (
            <button
              onClick={() =>
                habit.completed_today ? unlogHabit(habit.id) : logHabit(habit.id)
              }
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                habit.completed_today
                  ? "bg-[#6C47FF] text-white"
                  : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60 border border-white/10"
              }`}
            >
              {habit.completed_today ? "\u{2713} Done today" : "Check In"}
            </button>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-2 text-sm text-white/40 hover:text-white/60 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => archiveHabit(habit.id)}
            className="px-3 py-2 text-sm text-white/40 hover:text-white/60 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            Archive
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-2 text-sm text-red-400/60 hover:text-red-400 bg-white/5 rounded-lg hover:bg-red-400/10 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#13131F] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/40 text-xs mb-2">
            <Flame size={14} />
            Current Streak
          </div>
          <p className={`text-2xl font-bold ${currentStreak > 0 ? "text-[#6C47FF]" : "text-white/20"}`}>
            {currentStreak}
            <span className="text-sm font-normal text-white/30 ml-1">days</span>
          </p>
        </div>

        <div className="bg-[#13131F] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/40 text-xs mb-2">
            <Trophy size={14} />
            Longest Streak
          </div>
          <p className="text-2xl font-bold text-white">
            {longestStreak}
            <span className="text-sm font-normal text-white/30 ml-1">days</span>
          </p>
        </div>

        <div className="bg-[#13131F] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/40 text-xs mb-2">
            <Target size={14} />
            Completion Rate
          </div>
          <p className="text-2xl font-bold text-white">
            {completionRate}
            <span className="text-sm font-normal text-white/30 ml-1">%</span>
          </p>
          <p className="text-[10px] text-white/20 mt-0.5">Last 30 days</p>
        </div>

        <div className="bg-[#13131F] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/40 text-xs mb-2">
            <CheckCircle size={14} />
            Total Check-ins
          </div>
          <p className="text-2xl font-bold text-white">{totalCheckIns}</p>
        </div>
      </div>

      {/* Full year heatmap */}
      <div className="bg-[#13131F] border border-white/5 rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-white/60">Activity</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedYear((y) => y - 1)}
              className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-white/60 font-medium min-w-[50px] text-center">
              {selectedYear}
            </span>
            <button
              onClick={() => setSelectedYear((y) => Math.min(y + 1, new Date().getFullYear()))}
              className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <HabitHeatmap logs={logDates} year={selectedYear} />
      </div>

      {/* Monthly breakdown */}
      <div className="bg-[#13131F] border border-white/5 rounded-xl p-5">
        <h2 className="text-sm font-medium text-white/60 mb-4">Monthly Breakdown — {selectedYear}</h2>
        <div className="space-y-2">
          {monthlyBreakdown.map((month) => (
            <div key={month.name} className="flex items-center gap-4">
              <span className="text-xs text-white/40 w-20 flex-shrink-0">{month.name}</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6C47FF] rounded-full transition-all"
                  style={{ width: `${month.rate}%` }}
                />
              </div>
              <span className="text-xs text-white/40 w-16 text-right flex-shrink-0">
                {month.logged}/{month.total}
              </span>
              <span className="text-xs text-white/30 w-10 text-right flex-shrink-0">
                {month.rate}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit modal */}
      <AddHabitModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={() => {}}
        onUpdate={updateHabit}
        editingHabit={habit}
        isPending={isUpdating}
      />
    </div>
  )
}

export default HabitDetailPage
