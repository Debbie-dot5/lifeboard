import type { DayOfWeek } from "@lifeboard/types"

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────

/**
 * Returns today's day of the week as a DayOfWeek type
 * e.g. "monday", "tuesday", etc.
 */
export const getTodayDayOfWeek = (): DayOfWeek => {
  const days: DayOfWeek[] = [
    "sunday", "monday", "tuesday", "wednesday",
    "thursday", "friday", "saturday"
  ]
  return days[new Date().getDay()]
}

/**
 * Formats a date string to a readable format
 * e.g. "March 9, 2026"
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Returns ISO date string for today: "YYYY-MM-DD"
 */
export const getTodayISO = (): string => {
  return new Date().toISOString().split("T")[0]
}

/**
 * Returns how many days ago a date was
 * e.g. "2 days ago", "Today", "Yesterday"
 */
export const getRelativeDate = (dateString: string): string => {
  const date = new Date(dateString)
  const today = new Date()
  const diffMs = today.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return formatDate(dateString)
}

// ─── STREAK HELPERS ───────────────────────────────────────────────────────────

/**
 * Calculates the current streak from an array of ISO date strings.
 * When scheduledDays is provided and non-empty, only scheduled days
 * count toward the streak — non-scheduled days are skipped.
 */
export const calculateStreak = (
  completedDates: string[],
  scheduledDays: number[] = []
): number => {
  if (completedDates.length === 0) return 0

  // No scheduled days filter — use original consecutive-day logic
  if (scheduledDays.length === 0) {
    const sorted = [...completedDates].sort((a, b) => b.localeCompare(a))
    const today = getTodayISO()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayISO = yesterday.toISOString().split("T")[0]

    if (sorted[0] !== today && sorted[0] !== yesterdayISO) return 0

    let streak = 1
    for (let i = 1; i < sorted.length; i++) {
      const current = new Date(sorted[i - 1])
      const prev = new Date(sorted[i])
      const diff = Math.round((current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
      if (diff === 1) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  // With scheduled days — walk backwards, skip non-scheduled days
  const logSet = new Set(completedDates)
  const today = new Date()
  const todayISO = getTodayISO()
  let streak = 0
  const checkDate = new Date(today)

  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split("T")[0]
    const dayOfWeek = checkDate.getDay()

    if (scheduledDays.includes(dayOfWeek)) {
      if (logSet.has(dateStr)) {
        streak++
      } else if (dateStr !== todayISO) {
        // Missed a past scheduled day — streak broken
        break
      }
    }

    checkDate.setDate(checkDate.getDate() - 1)
  }

  return streak
}

/**
 * Calculates the longest streak ever from an array of ISO date strings.
 * Unlike calculateStreak (which checks from today), this searches all history.
 * When scheduledDays is provided, non-scheduled days are skipped.
 */
export const calculateLongestStreak = (
  completedDates: string[],
  scheduledDays: number[] = []
): number => {
  if (completedDates.length === 0) return 0

  // No scheduled days filter — original consecutive-day logic
  if (scheduledDays.length === 0) {
    const sorted = [...new Set(completedDates)].sort((a, b) => a.localeCompare(b))
    let maxStreak = 1
    let currentRun = 1

    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1])
      const curr = new Date(sorted[i])
      const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
      if (diff === 1) {
        currentRun++
        if (currentRun > maxStreak) maxStreak = currentRun
      } else if (diff > 1) {
        currentRun = 1
      }
    }
    return maxStreak
  }

  // With scheduled days — walk through date range, only count scheduled days
  const sorted = [...new Set(completedDates)].sort((a, b) => a.localeCompare(b))
  const logSet = new Set(sorted)
  const start = new Date(sorted[0])
  const end = new Date(sorted[sorted.length - 1])
  let maxStreak = 0
  let currentRun = 0
  const d = new Date(start)

  while (d <= end) {
    if (scheduledDays.includes(d.getDay())) {
      const dateStr = d.toISOString().split("T")[0]
      if (logSet.has(dateStr)) {
        currentRun++
        if (currentRun > maxStreak) maxStreak = currentRun
      } else {
        currentRun = 0
      }
    }
    d.setDate(d.getDate() + 1)
  }

  return maxStreak
}

/**
 * Calculates completion rate for the last N days (default 30).
 * Returns 0–100 percentage.
 * When scheduledDays is provided, only scheduled days count toward the total.
 */
export const calculateCompletionRate = (
  completedDates: string[],
  days = 30,
  scheduledDays: number[] = []
): number => {
  const todayISO = getTodayISO()
  const today = new Date(todayISO)
  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() - days + 1)
  const cutoffISO = cutoff.toISOString().split("T")[0]

  const unique = new Set(completedDates.filter((d) => d >= cutoffISO && d <= todayISO))

  if (scheduledDays.length === 0) {
    return Math.round((unique.size / days) * 100)
  }

  // Count how many of the last N days were scheduled days
  let scheduledCount = 0
  const d = new Date(cutoff)
  while (d <= today) {
    if (scheduledDays.includes(d.getDay())) scheduledCount++
    d.setDate(d.getDate() + 1)
  }

  if (scheduledCount === 0) return 0
  return Math.round((unique.size / scheduledCount) * 100)
}

// ─── PROGRESS HELPERS ─────────────────────────────────────────────────────────

/**
 * Calculates progress percentage (0–100)
 */
export const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

// ─── DURATION HELPERS ─────────────────────────────────────────────────────────

/**
 * Formats minutes into a human readable string
 * e.g. 90 => "1h 30m", 45 => "45m", 120 => "2h"
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remaining = minutes % 60
  if (remaining === 0) return `${hours}h`
  return `${hours}h ${remaining}m`
}

// ─── STRING HELPERS ───────────────────────────────────────────────────────────

/**
 * Capitalizes first letter of a string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Truncates a string with ellipsis
 */
export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + "..."
}

/**
 * Extracts plain text from BlockNote JSON content string.
 * Walks blocks[].content[].text and joins into a single string.
 */
export const extractPlainText = (contentJson: string, maxLength = 150): string => {
  try {
    const blocks = JSON.parse(contentJson)
    if (!Array.isArray(blocks)) return ""
    const text = blocks
      .flatMap((block: any) =>
        Array.isArray(block.content)
          ? block.content.map((c: any) => c.text ?? "").join("")
          : []
      )
      .join(" ")
      .trim()
    return truncate(text, maxLength)
  } catch {
    return ""
  }
}
