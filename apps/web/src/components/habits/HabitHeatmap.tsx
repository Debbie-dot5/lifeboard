"use client"

import { useMemo } from "react"
import { getTodayISO } from "@lifeboard/lib"

type Props = {
  logs: string[]
  year?: number
  mini?: boolean
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""]

const HabitHeatmap = ({ logs, year, mini = false }: Props) => {
  const today = getTodayISO()
  const currentYear = new Date().getFullYear()
  const targetYear = year ?? currentYear

  const logSet = useMemo(() => new Set(logs), [logs])

  // ── MINI MODE: last 4 weeks (28 days in a row) ──────────────────────────
  if (mini) {
    const days = useMemo(() => {
      const result: string[] = []
      const d = new Date(today)
      for (let i = 27; i >= 0; i--) {
        const date = new Date(d)
        date.setDate(d.getDate() - i)
        result.push(date.toISOString().split("T")[0])
      }
      return result
    }, [today])

    return (
      <div className="flex gap-[2px]">
        {days.map((date) => (
          <div
            key={date}
            className={`w-[10px] h-[10px] rounded-[2px] ${
              logSet.has(date) ? "bg-[#6C47FF]" : "bg-white/5"
            } ${date === today ? "ring-1 ring-white/30" : ""}`}
          />
        ))}
      </div>
    )
  }

  // ── FULL MODE: 53 cols x 7 rows ────────────────────────────────────────
  const { grid, monthPositions } = useMemo(() => {
    const startDate = new Date(targetYear, 0, 1)
    const endDate = targetYear === currentYear ? new Date(today) : new Date(targetYear, 11, 31)
    const startDow = startDate.getDay() // 0=Sun

    // Build flat array of cells
    const cells: (string | null)[] = []

    // Pad start to align with week columns (Sunday = row 0)
    for (let i = 0; i < startDow; i++) {
      cells.push(null)
    }

    const d = new Date(startDate)
    while (d <= endDate) {
      cells.push(d.toISOString().split("T")[0])
      d.setDate(d.getDate() + 1)
    }

    // Build grid: columns of weeks, rows of days (0=Sun..6=Sat)
    const weeks: (string | null)[][] = []
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7))
    }
    // Pad last week if incomplete
    const lastWeek = weeks[weeks.length - 1]
    if (lastWeek && lastWeek.length < 7) {
      while (lastWeek.length < 7) {
        lastWeek.push(null)
      }
    }

    // Month label positions
    const positions: { label: string; col: number }[] = []
    let lastMonth = -1
    for (let col = 0; col < weeks.length; col++) {
      const firstDate = weeks[col].find((d) => d !== null)
      if (firstDate) {
        const month = parseInt(firstDate.split("-")[1], 10) - 1
        if (month !== lastMonth) {
          positions.push({ label: MONTH_LABELS[month], col })
          lastMonth = month
        }
      }
    }

    return { grid: weeks, monthPositions: positions }
  }, [targetYear, currentYear, today])

  const cellSize = 12
  const gap = 2
  const step = cellSize + gap
  const labelWidth = 28
  const headerHeight = 16

  return (
    <div className="overflow-x-auto">
      <svg
        width={labelWidth + grid.length * step}
        height={headerHeight + 7 * step}
        className="block"
      >
        {/* Month labels */}
        {monthPositions.map(({ label, col }) => (
          <text
            key={`${label}-${col}`}
            x={labelWidth + col * step}
            y={11}
            className="fill-white/30 text-[10px]"
            style={{ fontSize: 10 }}
          >
            {label}
          </text>
        ))}

        {/* Day labels */}
        {DAY_LABELS.map((label, row) =>
          label ? (
            <text
              key={row}
              x={0}
              y={headerHeight + row * step + cellSize - 2}
              className="fill-white/30 text-[10px]"
              style={{ fontSize: 10 }}
            >
              {label}
            </text>
          ) : null
        )}

        {/* Grid cells */}
        {grid.map((week, col) =>
          week.map((date, row) => {
            if (!date) return null
            const isLogged = logSet.has(date)
            const isToday = date === today

            return (
              <rect
                key={date}
                x={labelWidth + col * step}
                y={headerHeight + row * step}
                width={cellSize}
                height={cellSize}
                rx={2}
                className={isLogged ? "fill-[#6C47FF]" : "fill-white/5"}
                style={isLogged ? { opacity: 0.7 } : undefined}
                stroke={isToday ? "rgba(255,255,255,0.3)" : "none"}
                strokeWidth={isToday ? 1 : 0}
              >
                <title>
                  {date} — {isLogged ? "Completed" : "Missed"}
                </title>
              </rect>
            )
          })
        )}
      </svg>
    </div>
  )
}

export default HabitHeatmap
