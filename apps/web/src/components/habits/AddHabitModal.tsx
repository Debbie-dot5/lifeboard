"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { createHabitSchema } from "@lifeboard/validations"
import { CATEGORY_CONFIG } from "./constants"
import type { Habit, HabitCategory, HabitFrequency, CreateHabitInput } from "@lifeboard/types"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: CreateHabitInput) => void
  onUpdate?: (habitId: string, updates: Partial<Omit<Habit, "id" | "user_id" | "created_at">>) => void
  editingHabit?: Habit | null
  isPending: boolean
}

const CATEGORIES = Object.keys(CATEGORY_CONFIG) as HabitCategory[]

const AddHabitModal = ({ isOpen, onClose, onSubmit, onUpdate, editingHabit, isPending }: Props) => {
  const [name, setName] = useState("")
  const [category, setCategory] = useState<HabitCategory>("custom")
  const [frequency, setFrequency] = useState<HabitFrequency>("daily")
  const [scheduledDays, setScheduledDays] = useState<number[]>([])
  const [validationError, setValidationError] = useState("")

  const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name)
      setCategory(editingHabit.category)
      setFrequency(editingHabit.frequency)
      setScheduledDays(editingHabit.scheduled_days ?? [])
    } else {
      setName("")
      setCategory("custom")
      setFrequency("daily")
      setScheduledDays([])
    }
    setValidationError("")
  }, [editingHabit, isOpen])

  const toggleDay = (day: number) => {
    setScheduledDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
  }

  const handleSubmit = () => {
    const days = frequency === "weekly" ? [] : scheduledDays
    const result = createHabitSchema.safeParse({ name, category, frequency, scheduled_days: days })
    if (!result.success) {
      setValidationError(result.error.errors[0].message)
      return
    }

    if (editingHabit && onUpdate) {
      onUpdate(editingHabit.id, { name, category, frequency, scheduled_days: days })
    } else {
      onSubmit({ name, category, frequency, scheduled_days: days })
    }
    onClose()
  }

  if (!isOpen) return null

  const selectedConfig = CATEGORY_CONFIG[category]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            {editingHabit ? "Edit Habit" : "New Habit"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Name input */}
        <div className="mb-4">
          <label className="block text-xs text-white/40 mb-1.5">Habit name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setValidationError("")
            }}
            placeholder="e.g. Meditate for 10 minutes"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:border-[#6C47FF] focus:outline-none transition-colors"
          />
          {validationError && (
            <p className="text-red-400 text-xs mt-1">{validationError}</p>
          )}
        </div>

        {/* Category selector */}
        <div className="mb-4">
          <label className="block text-xs text-white/40 mb-1.5">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const config = CATEGORY_CONFIG[cat]
              const isSelected = category === cat
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#6C47FF] text-white"
                      : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
                  }`}
                >
                  <span>{config.emoji}</span>
                  {config.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Suggestions */}
        {selectedConfig.suggestions.length > 0 && (
          <div className="mb-4">
            <label className="block text-xs text-white/40 mb-1.5">Suggestions</label>
            <div className="flex flex-wrap gap-1.5">
              {selectedConfig.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setName(suggestion)
                    setValidationError("")
                  }}
                  className="px-2.5 py-1 rounded-full text-xs bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Frequency toggle */}
        <div className="mb-6">
          <label className="block text-xs text-white/40 mb-1.5">Frequency</label>
          <div className="flex gap-1 bg-white/5 rounded-lg p-1 w-fit">
            {(["daily", "weekly"] as HabitFrequency[]).map((freq) => (
              <button
                key={freq}
                onClick={() => setFrequency(freq)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  frequency === freq
                    ? "bg-[#6C47FF] text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                {freq === "daily" ? "Daily" : "Weekly"}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 px-4 py-2 bg-[#6C47FF] text-white text-sm font-medium rounded-lg hover:bg-[#5835FF] transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving..." : editingHabit ? "Update" : "Create Habit"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddHabitModal
