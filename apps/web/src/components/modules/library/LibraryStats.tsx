"use client"

import { BookOpen, CheckCircle, Flame, Target } from "lucide-react"

type Props = {
  totalBooks: number
  finishedCount: number
  readingStreak: number
  goalProgress: { target: number; current: number } | null
}

const LibraryStats = ({ totalBooks, finishedCount, readingStreak, goalProgress }: Props) => {
  const stats = [
    {
      icon: BookOpen,
      label: "Total Books",
      value: totalBooks,
    },
    {
      icon: CheckCircle,
      label: "Finished This Year",
      value: finishedCount,
    },
    {
      icon: Flame,
      label: "Reading Streak",
      value: `${readingStreak}d`,
    },
    {
      icon: Target,
      label: "Goal Progress",
      value: goalProgress
        ? `${goalProgress.current}/${goalProgress.target}`
        : "—",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-amber-950/20 border border-amber-800/20 rounded-xl p-3.5"
        >
          <div className="flex items-center gap-2 mb-1">
            <stat.icon className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] uppercase tracking-wider text-amber-100/40 font-medium">
              {stat.label}
            </span>
          </div>
          <p className="text-xl font-bold text-amber-100">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}

export default LibraryStats
