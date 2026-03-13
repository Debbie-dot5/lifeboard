"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { TEMPLATE_CONFIG } from "./constants"
import type { PlanWithProgress } from "@lifeboard/lib"

type Props = {
  plans: PlanWithProgress[]
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const PlannerCalendarView = ({ plans }: Props) => {
  const router = useRouter()
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  const todayStr = today.toISOString().split("T")[0]

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const startPad = firstDay.getDay()
    const totalDays = lastDay.getDate()

    const days: { date: string; day: number; isCurrentMonth: boolean }[] = []

    // Previous month padding
    const prevMonthLast = new Date(currentYear, currentMonth, 0).getDate()
    for (let i = startPad - 1; i >= 0; i--) {
      const d = prevMonthLast - i
      const date = new Date(currentYear, currentMonth - 1, d)
      days.push({
        date: date.toISOString().split("T")[0],
        day: d,
        isCurrentMonth: false,
      })
    }

    // Current month
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(currentYear, currentMonth, d)
      days.push({
        date: date.toISOString().split("T")[0],
        day: d,
        isCurrentMonth: true,
      })
    }

    // Next month padding
    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(currentYear, currentMonth + 1, d)
      days.push({
        date: date.toISOString().split("T")[0],
        day: d,
        isCurrentMonth: false,
      })
    }

    return days
  }, [currentMonth, currentYear])

  // Group plans by deadline date
  const plansByDate = useMemo(() => {
    const map: Record<string, PlanWithProgress[]> = {}
    plans.forEach((plan) => {
      if (plan.deadline) {
        if (!map[plan.deadline]) map[plan.deadline] = []
        map[plan.deadline].push(plan)
      }
    })
    return map
  }, [plans])

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const goToToday = () => {
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
  }

  const monthLabel = new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <div>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">{monthLabel}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-2.5 py-1 text-[10px] font-medium text-[#6C47FF] bg-[#6C47FF]/10 rounded-lg hover:bg-[#6C47FF]/20 transition-colors"
          >
            Today
          </button>
          <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
            <ChevronLeft size={16} className="text-white/40" />
          </button>
          <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
            <ChevronRight size={16} className="text-white/40" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-[10px] font-medium text-white/30 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-white/5 rounded-xl overflow-hidden">
        {calendarDays.map(({ date, day, isCurrentMonth }) => {
          const dayPlans = plansByDate[date] ?? []
          const isToday = date === todayStr
          const isExpanded = expandedDay === date
          const visiblePlans = isExpanded ? dayPlans : dayPlans.slice(0, 2)
          const extraCount = dayPlans.length - 2

          return (
            <div
              key={date}
              onClick={() => {
                if (dayPlans.length === 0) {
                  router.push(`/planner/new?deadline=${date}`)
                }
              }}
              className={`min-h-[80px] p-1.5 bg-[#13131F] transition-colors ${
                isCurrentMonth ? "" : "opacity-30"
              } ${dayPlans.length === 0 && isCurrentMonth ? "cursor-pointer hover:bg-white/5" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? "bg-[#6C47FF] text-white font-bold"
                      : "text-white/50"
                  }`}
                >
                  {day}
                </span>
                {dayPlans.length > 0 && !isToday && (
                  <div className="w-1 h-1 rounded-full bg-[#6C47FF]" />
                )}
              </div>

              {/* Plan chips */}
              <div className="space-y-0.5">
                {visiblePlans.map((plan) => {
                  const config = TEMPLATE_CONFIG[plan.template_type] ?? TEMPLATE_CONFIG.custom
                  return (
                    <button
                      key={plan.id}
                      onClick={(e) => { e.stopPropagation(); router.push(`/planner/${plan.id}`) }}
                      className="w-full text-left text-[9px] px-1.5 py-0.5 rounded truncate font-medium"
                      style={{ backgroundColor: config.color + "20", color: config.color }}
                    >
                      {plan.title}
                    </button>
                  )
                })}
                {!isExpanded && extraCount > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpandedDay(date) }}
                    className="w-full text-left text-[9px] px-1.5 py-0.5 text-[#6C47FF] hover:underline"
                  >
                    +{extraCount} more
                  </button>
                )}
                {isExpanded && dayPlans.length > 2 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setExpandedDay(null) }}
                    className="w-full text-left text-[9px] px-1.5 py-0.5 text-white/30 hover:text-white/50"
                  >
                    Show less
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PlannerCalendarView
