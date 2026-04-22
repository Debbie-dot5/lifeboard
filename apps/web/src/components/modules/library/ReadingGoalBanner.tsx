"use client"

import { Target } from "lucide-react"

type Props = {
  yearlyProgress: { target: number; current: number } | null
  monthlyProgress: { target: number; current: number } | null
  readingStreak: number
  onSetGoal: () => void
}

const ReadingGoalBanner = ({ yearlyProgress, monthlyProgress, readingStreak, onSetGoal }: Props) => {
  const currentYear = new Date().getFullYear()
  const monthName = new Date().toLocaleString("en-US", { month: "long" })

  if (!yearlyProgress && !monthlyProgress) {
    return (
      <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-900/40 flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-100">
                Set a reading goal for {currentYear}
              </p>
              <p className="text-xs text-amber-100/40">
                Track your reading progress throughout the year
              </p>
            </div>
          </div>
          <button
            onClick={onSetGoal}
            className="px-4 py-2 md:py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-500 transition-colors w-full md:w-auto"
          >
            Set Goal
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-amber-100">Reading Goals</span>
        </div>
        <div className="flex items-center gap-3">
          {readingStreak > 0 && (
            <span className="text-xs text-amber-300">
              🔥 {readingStreak} day streak
            </span>
          )}
          <button
            onClick={onSetGoal}
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Yearly goal */}
      {yearlyProgress && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-amber-100/60">
              {yearlyProgress.current} of {yearlyProgress.target} books · {currentYear}
            </span>
            <span className="text-xs text-amber-400 font-medium">
              {Math.round((yearlyProgress.current / yearlyProgress.target) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-amber-900/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((yearlyProgress.current / yearlyProgress.target) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Monthly goal */}
      {monthlyProgress && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-amber-100/60">
              {monthlyProgress.current} of {monthlyProgress.target} books · {monthName} {currentYear}
            </span>
            <span className="text-xs text-amber-400 font-medium">
              {Math.round((monthlyProgress.current / monthlyProgress.target) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-amber-900/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((monthlyProgress.current / monthlyProgress.target) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ReadingGoalBanner
