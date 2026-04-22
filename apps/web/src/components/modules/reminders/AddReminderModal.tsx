"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { createReminderSchema } from "@lifeboard/validations"
import type { Reminder, ReminderType, ReminderRecurrence, CreateReminderInput } from "@lifeboard/types"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: CreateReminderInput) => void
  onUpdate?: (
    reminderId: string,
    updates: Partial<Omit<Reminder, "id" | "user_id" | "created_at">>
  ) => void
  editingReminder?: Reminder | null
  isPending: boolean
}

const TYPE_OPTIONS: { value: ReminderType; label: string }[] = [
  { value: "birthday", label: "Birthday" },
  { value: "health", label: "Health" },
  { value: "custom", label: "Custom" },
]

const RECURRENCE_OPTIONS: { value: ReminderRecurrence; label: string }[] = [
  { value: "once", label: "Once" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
]

const computeBirthdayTrigger = (birthdayDateStr: string): string => {
  const [_, monthStr, dayStr] = birthdayDateStr.split("-")
  const month = parseInt(monthStr, 10)
  const day = parseInt(dayStr, 10)
  const now = new Date()

  let birthday = new Date(now.getFullYear(), month - 1, day)
  if (birthday <= now) {
    birthday = new Date(now.getFullYear() + 1, month - 1, day)
  }

  const trigger = new Date(birthday)
  trigger.setDate(trigger.getDate() - 3)
  trigger.setHours(9, 0, 0, 0)
  return trigger.toISOString()
}

const formatMonthDay = (dateStr: string): string => {
  const [_, monthStr, dayStr] = dateStr.split("-")
  const date = new Date(2000, parseInt(monthStr, 10) - 1, parseInt(dayStr, 10))
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" })
}

const AddReminderModal = ({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  editingReminder,
  isPending,
}: Props) => {
  const [type, setType] = useState<ReminderType>("custom")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [triggerAt, setTriggerAt] = useState("")
  const [recurrence, setRecurrence] = useState<ReminderRecurrence>("once")
  const [birthdayPersonName, setBirthdayPersonName] = useState("")
  const [birthdayDate, setBirthdayDate] = useState("")
  const [validationError, setValidationError] = useState("")

  // Pre-fill when editing
  useEffect(() => {
    if (editingReminder) {
      setType(editingReminder.type)
      setTitle(editingReminder.title)
      setDescription(editingReminder.description ?? "")
      setRecurrence(editingReminder.recurrence)

      // Convert ISO to datetime-local format
      const dt = new Date(editingReminder.trigger_at)
      const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      setTriggerAt(local)

      if (editingReminder.type === "birthday") {
        const nameMatch = editingReminder.title.replace("'s Birthday", "")
        setBirthdayPersonName(nameMatch)
      }
    } else {
      setType("custom")
      setTitle("")
      setDescription("")
      setTriggerAt("")
      setRecurrence("once")
      setBirthdayPersonName("")
      setBirthdayDate("")
      setValidationError("")
    }
  }, [editingReminder, isOpen])

  if (!isOpen) return null

  const handleSubmit = () => {
    setValidationError("")

    let finalTitle = title
    let finalTriggerAt = triggerAt ? new Date(triggerAt).toISOString() : ""
    let finalRecurrence = recurrence
    let finalDescription: string | null = description || null

    if (type === "birthday") {
      if (!birthdayPersonName.trim()) {
        setValidationError("Person's name is required")
        return
      }
      if (!birthdayDate) {
        setValidationError("Birthday date is required")
        return
      }
      finalTitle = `${birthdayPersonName.trim()}'s Birthday`
      finalTriggerAt = computeBirthdayTrigger(birthdayDate)
      finalRecurrence = "yearly"
      finalDescription = description || `Birthday: ${formatMonthDay(birthdayDate)}`
    }

    const input: CreateReminderInput = {
      type,
      title: finalTitle,
      description: finalDescription,
      trigger_at: finalTriggerAt,
      recurrence: finalRecurrence,
      is_active: true,
    }

    const result = createReminderSchema.safeParse(input)
    if (!result.success) {
      setValidationError(result.error.errors[0]?.message ?? "Invalid input")
      return
    }

    if (editingReminder && onUpdate) {
      onUpdate(editingReminder.id, input)
    } else {
      onSubmit(input)
    }
    onClose()
  }

  const inputClass =
    "w-full rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 glass-input"

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ background: "rgba(5, 5, 16, 0.75)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
      <div className="rounded-t-2xl md:rounded-2xl p-6 w-full md:max-w-md md:mx-4 max-h-[90vh] overflow-y-auto safe-bottom animate-slide-in-bottom md:animate-none" style={{ background: "rgba(15, 12, 30, 0.85)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", boxShadow: "0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 0 0 1px rgba(108,71,255,0.1)" }}>
        {/* Swipe handle (mobile) */}
        <div className="md:hidden mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
        {/* Header */}
        <div className="flex items-center justify-between mb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "16px", background: "linear-gradient(180deg, rgba(108,71,255,0.06) 0%, transparent 100%)" }}>
          <h2 className="text-lg font-bold text-white">
            {editingReminder ? "Edit Reminder" : "New Reminder"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Type Selector */}
        <div className="flex gap-2 mb-6">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setType(opt.value)
                setValidationError("")
              }}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                type === opt.value
                  ? "text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
              style={
                type === opt.value
                  ? { background: "rgba(108,71,255,0.2)", border: "1px solid rgba(108,71,255,0.3)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 0 20px rgba(108,71,255,0.15)" }
                  : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {type === "birthday" ? (
            <>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Person&apos;s Name</label>
                <input
                  type="text"
                  value={birthdayPersonName}
                  onChange={(e) => setBirthdayPersonName(e.target.value)}
                  placeholder="e.g., Mom, John"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Birthday Date</label>
                <input
                  type="date"
                  value={birthdayDate}
                  onChange={(e) => setBirthdayDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <p className="text-xs text-white/30">
                You&apos;ll be notified 3 days before the birthday, yearly.
              </p>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    type === "health"
                      ? "e.g., Drink Water, Take Vitamin D"
                      : "e.g., Submit report"
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Date & Time</label>
                <input
                  type="datetime-local"
                  value={triggerAt}
                  onChange={(e) => setTriggerAt(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Recurrence</label>
                <div className="flex gap-2">
                  {(type === "health"
                    ? RECURRENCE_OPTIONS.filter((o) => ["once", "daily", "weekly"].includes(o.value))
                    : RECURRENCE_OPTIONS
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setRecurrence(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        recurrence === opt.value
                          ? "text-white"
                          : "text-white/40 hover:text-white/60"
                      }`}
                      style={
                        recurrence === opt.value
                          ? { background: "rgba(108,71,255,0.2)", border: "1px solid rgba(108,71,255,0.3)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }
                          : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Description — shown for all types */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5">
              Description <span className="text-white/20">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a note..."
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {/* Validation Error */}
        {validationError && (
          <p className="text-red-400 text-xs mt-3">{validationError}</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-white/40 hover:text-white transition-colors rounded-lg"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="px-5 py-2 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, rgba(108,71,255,0.9), rgba(79,47,224,0.9))", border: "1px solid rgba(108,71,255,0.5)", boxShadow: "0 4px 20px rgba(108,71,255,0.3), inset 0 1px 0 rgba(255,255,255,0.2)" }}
          >
            {isPending ? "Saving..." : editingReminder ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddReminderModal
