"use client"

import { useState, useRef, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import useRemindersHook from "@/lib/hooks/useReminders"
import AddReminderModal from "@/components/modules/reminders/AddReminderModal"
import {
  Plus,
  Cake,
  Heart,
  Bell,
  MoreVertical,
  BellOff,
  Pencil,
  Trash2,
} from "lucide-react"
import type { Reminder, ReminderType } from "@lifeboard/types"

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

const FILTER_OPTIONS: { value: "all" | ReminderType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "birthday", label: "Birthdays" },
  { value: "health", label: "Health" },
  { value: "custom", label: "Custom" },
]

const TYPE_CONFIG: Record<
  ReminderType,
  { icon: typeof Bell; color: string; borderColor: string; bgColor: string }
> = {
  birthday: {
    icon: Cake,
    color: "text-pink-400",
    borderColor: "border-l-pink-400",
    bgColor: "bg-pink-500/10",
  },
  health: {
    icon: Heart,
    color: "text-blue-400",
    borderColor: "border-l-blue-400",
    bgColor: "bg-blue-500/10",
  },
  custom: {
    icon: Bell,
    color: "text-[#6C47FF]",
    borderColor: "border-l-[#6C47FF]",
    bgColor: "bg-[#6C47FF]/10",
  },
}

const getDaysUntil = (triggerAt: string): number => {
  const now = new Date()
  const trigger = new Date(triggerAt)
  return Math.ceil((trigger.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

const formatTriggerDate = (triggerAt: string): string => {
  const date = new Date(triggerAt)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

const RECURRENCE_LABELS: Record<string, string> = {
  once: "Once",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
}

// ─── REMINDER CARD ──────────────────────────────────────────────────────────

const ReminderCard = ({
  reminder,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  reminder: Reminder
  onEdit: (r: Reminder) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, active: boolean) => void
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const config = TYPE_CONFIG[reminder.type]
  const Icon = config.icon
  const daysUntil = getDaysUntil(reminder.trigger_at)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuOpen])

  return (
    <div
      className={`relative bg-[#13131F] rounded-xl border border-white/5 border-l-4 ${config.borderColor} p-5 hover:border-[#6C47FF]/30 hover:shadow-[0_0_20px_rgba(108,71,255,0.08)] transition-all group ${
        !reminder.is_active ? "opacity-50" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.color} ${config.bgColor}`}>
          <Icon size={12} />
          {reminder.type === "birthday" ? "Birthday" : reminder.type === "health" ? "Health" : "Custom"}
        </div>

        {/* Menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-all"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 bg-[#1A1A2E] border border-white/10 rounded-lg shadow-xl py-1 z-10 min-w-[120px]">
              <button
                onClick={() => {
                  onEdit(reminder)
                  setMenuOpen(false)
                }}
                className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Pencil size={14} />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(reminder.id)
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

      {/* Title */}
      <h3 className="text-white font-medium mb-1">{reminder.title}</h3>

      {/* Description */}
      {reminder.description && (
        <p className="text-white/40 text-sm mb-3 line-clamp-2">{reminder.description}</p>
      )}

      {/* Birthday countdown */}
      {reminder.type === "birthday" && reminder.is_active && daysUntil > 0 && (
        <p className="text-pink-400 text-xs font-medium mb-3">
          {daysUntil === 1 ? "Tomorrow" : `in ${daysUntil} days`}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-xs">{formatTriggerDate(reminder.trigger_at)}</span>
          <span className="px-1.5 py-0.5 rounded bg-white/5 text-white/30 text-[10px] font-medium">
            {RECURRENCE_LABELS[reminder.recurrence]}
          </span>
        </div>

        {/* Toggle */}
        <button
          onClick={() => onToggleActive(reminder.id, !reminder.is_active)}
          className={`relative w-9 h-5 rounded-full transition-colors ${
            reminder.is_active ? "bg-[#6C47FF]" : "bg-white/10"
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              reminder.is_active ? "left-[18px]" : "left-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  )
}

// ─── PAGE ───────────────────────────────────────────────────────────────────

const RemindersPage = () => {
  const { data: user } = useUser()
  const [activeFilter, setActiveFilter] = useState<"all" | ReminderType>("all")
  const [showModal, setShowModal] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)

  const {
    reminders,
    activeReminders,
    isLoading,
    createReminder,
    updateReminder,
    deleteReminder,
    toggleActive,
    isCreating,
    isUpdating,
  } = useRemindersHook(user?.id ?? "")

  const filteredReminders =
    activeFilter === "all"
      ? reminders
      : reminders.filter((r) => r.type === activeFilter)

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingReminder(null)
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Reminders</h1>
          <p className="text-white/40 text-sm">
            {activeReminders.length} active reminder{activeReminders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#6C47FF] text-white text-sm font-medium rounded-lg hover:bg-[#5835FF] transition-colors"
        >
          <Plus size={16} />
          Add Reminder
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-6">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setActiveFilter(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeFilter === opt.value
                ? "bg-[#6C47FF] text-white"
                : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#6C47FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredReminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <BellOff size={48} className="mb-4" />
          <p className="text-lg font-medium mb-1">No reminders yet</p>
          <p className="text-sm">
            {activeFilter !== "all"
              ? `No ${activeFilter} reminders found`
              : "Create your first reminder to get started"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReminders.map((reminder) => (
            <ReminderCard
              key={reminder.id}
              reminder={reminder}
              onEdit={handleEdit}
              onDelete={deleteReminder}
              onToggleActive={toggleActive}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <AddReminderModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={createReminder}
        onUpdate={updateReminder}
        editingReminder={editingReminder}
        isPending={isCreating || isUpdating}
      />
    </div>
  )
}

export default RemindersPage
