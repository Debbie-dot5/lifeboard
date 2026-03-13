"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { JournalEntry } from "@lifeboard/types"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const CalendarView = ({
  entries,
  onDateClick,
  selectedDate,
}: {
  entries: JournalEntry[]
  onDateClick: (date: string) => void
  selectedDate: string | null
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const todayISO = new Date().toISOString().split("T")[0]

  const entriesByDate = useMemo(() => {
    const map = new Map<string, JournalEntry[]>()
    entries.forEach((entry) => {
      const date = entry.created_at.split("T")[0]
      if (!map.has(date)) map.set(date, [])
      map.get(date)!.push(entry)
    })
    return map
  }, [entries])

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days: { date: string; day: number; isCurrentMonth: boolean }[] = []

    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate()
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i
      const prevMonth = month === 0 ? 11 : month - 1
      const prevYear = month === 0 ? year - 1 : year
      days.push({
        date: `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        day: d,
        isCurrentMonth: false,
      })
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        date: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        day: d,
        isCurrentMonth: true,
      })
    }

    // Next month padding
    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 11 ? 0 : month + 1
      const nextYear = month === 11 ? year + 1 : year
      days.push({
        date: `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        day: d,
        isCurrentMonth: false,
      })
    }

    return days
  }, [currentMonth])

  const prevMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const monthLabel = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div className="bg-[#13131F] rounded-xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-white font-medium">{monthLabel}</h3>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs text-white/30 py-2 font-medium">
            {day}
          </div>
        ))}

        {calendarDays.map(({ date, day, isCurrentMonth }) => {
          const hasEntries = entriesByDate.has(date)
          const isToday = date === todayISO
          const isSelected = date === selectedDate

          return (
            <button
              key={date}
              onClick={() => onDateClick(date)}
              className={`relative p-2 rounded-lg text-sm transition-all ${
                !isCurrentMonth
                  ? "text-white/15"
                  : isSelected
                    ? "bg-[#6C47FF]/20 text-[#6C47FF] ring-1 ring-[#6C47FF]/50"
                    : isToday
                      ? "text-white ring-1 ring-[#6C47FF]/30"
                      : "text-white/60 hover:bg-white/5"
              }`}
            >
              {day}
              {hasEntries && isCurrentMonth && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#6C47FF] rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CalendarView
