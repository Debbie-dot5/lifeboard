"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import useHabitsHook from "@/lib/hooks/useHabits"
import AddHabitModal from "@/components/habits/AddHabitModal"
import HabitHeatmap from "@/components/habits/HabitHeatmap"
import StreakToast from "@/components/habits/StreakToast"
import { CATEGORY_CONFIG, CATEGORY_FILTER_OPTIONS } from "@/components/habits/constants"
import { Plus, MoreVertical, Pencil, Trash2, Archive, Flame, Check } from "lucide-react"
import type { HabitWithTodayStatus } from "@lifeboard/lib"
import type { Habit, HabitCategory } from "@lifeboard/types"

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

// ─── HABIT CARD ──────────────────────────────────────────────────────────────

const HabitCard = ({
  habit,
  onToggle,
  onEdit,
  onArchive,
  onDelete,
  onClick,
}: {
  habit: HabitWithTodayStatus
  onToggle: () => void
  onEdit: (h: Habit) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onClick: () => void
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const config = CATEGORY_CONFIG[habit.category]

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuOpen])

  const streakMilestone =
    habit.current_streak >= 100
      ? "\u{1F451} 100 days!"
      : habit.current_streak >= 30
        ? "\u{1F3C6} 1 month streak!"
        : habit.current_streak >= 7
          ? "\u{1F389} 1 week streak!"
          : null

  return (
    <div
      className={`relative bg-[#13131F] rounded-xl border border-l-[3px] overflow-hidden hover:border-[#6C47FF]/30 hover:shadow-[0_0_20px_rgba(108,71,255,0.08)] transition-all group ${
        habit.is_archived ? "opacity-50 border-gray-500/30" : "border-white/5"
      }`}
      style={{ borderLeftColor: habit.is_archived ? "#6B7280" : config.color }}
    >
      {/* Clickable body */}
      <div className="p-5 pb-3 cursor-pointer" onClick={onClick}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: `${config.color}15`, color: config.color }}
            >
              {config.emoji} {config.label}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/30 text-[10px] font-medium">
              {habit.frequency === "daily" ? "Daily" : "Weekly"}
            </span>
            {habit.is_archived && (
              <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/30 text-[10px] font-medium">
                Archived
              </span>
            )}
          </div>

          {/* Menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen(!menuOpen)
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-all"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 bg-[#1A1A2E] border border-white/10 rounded-lg shadow-xl py-1 z-10 min-w-[120px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(habit)
                    setMenuOpen(false)
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onArchive(habit.id)
                    setMenuOpen(false)
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Archive size={14} />
                  Archive
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(habit.id)
                    setMenuOpen(false)
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Habit name */}
        <h3 className="text-white font-medium mb-2">{habit.name}</h3>

        {/* Streak */}
        <div className="flex items-baseline gap-1.5 mb-2">
          <span
            className={`text-3xl font-bold ${
              habit.current_streak > 0 ? "text-[#6C47FF]" : "text-white/20"
            }`}
          >
            {habit.current_streak}
          </span>
          <span className="text-sm text-white/30">
            {habit.current_streak > 0 ? "\u{1F525}" : ""} day{habit.current_streak !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Streak milestone */}
        {streakMilestone && (
          <p className="text-xs text-[#6C47FF] font-medium mb-2">{streakMilestone}</p>
        )}

        {/* Mini heatmap */}
        <div className="mb-1">
          <HabitHeatmap logs={habit.all_log_dates} mini />
        </div>
      </div>

      {/* Check-in button */}
      {!habit.is_archived && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
          className={`w-full py-2.5 text-sm font-medium transition-all rounded-b-xl ${
            habit.completed_today
              ? "bg-[#6C47FF] text-white"
              : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
          }`}
        >
          {habit.completed_today ? "\u{2713} Done today" : "Mark done today"}
        </button>
      )}
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

const HabitsPage = () => {
  const router = useRouter()
  const { data: user } = useUser()
  const [activeCategory, setActiveCategory] = useState<HabitCategory | "all">("all")
  const [showArchived, setShowArchived] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [toastData, setToastData] = useState<{ streak: number; habitName: string } | null>(null)

  const {
    activeHabits,
    archivedHabits,
    todayProgress,
    isLoading,
    logHabit,
    unlogHabit,
    createHabit,
    updateHabit,
    archiveHabit,
    deleteHabit,
    isCreating,
    isUpdating,
  } = useHabitsHook(user?.id ?? "", {
    onStreakMilestone: (days, name) => setToastData({ streak: days, habitName: name }),
  })

  const displayHabits = [
    ...activeHabits,
    ...(showArchived ? archivedHabits : []),
  ].filter((h) => activeCategory === "all" || h.category === activeCategory)

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingHabit(null)
  }

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Habits</h1>
          <p className="text-white/40 text-sm">{todayFormatted}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#6C47FF] text-white text-sm font-medium rounded-lg hover:bg-[#5835FF] transition-colors"
        >
          <Plus size={16} />
          Add Habit
        </button>
      </div>

      {/* Quick check-in banner */}
      {activeHabits.length > 0 && (
        <div className="bg-[#13131F] rounded-xl p-4 mb-6 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/40 font-medium">
              Quick Check-in — {todayProgress.completed}/{todayProgress.total} done
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {activeHabits.map((habit) => (
              <button
                key={habit.id}
                onClick={() =>
                  habit.completed_today ? unlogHabit(habit.id) : logHabit(habit.id)
                }
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  habit.completed_today
                    ? "bg-[#6C47FF]/10 border border-[#6C47FF]/30 text-[#6C47FF]"
                    : "bg-white/5 border border-white/10 text-white/50 hover:bg-white/10"
                }`}
              >
                {habit.completed_today && <Check size={12} />}
                <span className={habit.completed_today ? "line-through" : ""}>
                  {habit.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category filter pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {CATEGORY_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setActiveCategory(opt.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategory === opt.value
                ? "bg-[#6C47FF] text-white"
                : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Archived toggle */}
      {archivedHabits.length > 0 && (
        <button
          onClick={() => setShowArchived(!showArchived)}
          className="text-xs text-white/30 hover:text-white/50 transition-colors mb-6"
        >
          {showArchived ? "Hide" : "Show"} archived ({archivedHabits.length})
        </button>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#6C47FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayHabits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Flame size={32} />
          </div>
          <p className="text-lg font-medium mb-1">No habits yet</p>
          <p className="text-sm mb-4">Build your first streak</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#6C47FF] text-white text-sm font-medium rounded-lg hover:bg-[#5835FF] transition-colors"
          >
            Create First Habit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={() =>
                habit.completed_today ? unlogHabit(habit.id) : logHabit(habit.id)
              }
              onEdit={handleEdit}
              onArchive={archiveHabit}
              onDelete={deleteHabit}
              onClick={() => router.push(`/habits/${habit.id}`)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <AddHabitModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={createHabit}
        onUpdate={updateHabit}
        editingHabit={editingHabit}
        isPending={isCreating || isUpdating}
      />

      {/* Streak toast */}
      {toastData && (
        <StreakToast
          streak={toastData.streak}
          habitName={toastData.habitName}
          onDismiss={() => setToastData(null)}
        />
      )}
    </div>
  )
}

export default HabitsPage
