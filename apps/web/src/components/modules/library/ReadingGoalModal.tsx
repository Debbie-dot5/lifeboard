"use client"

import { useState, useEffect } from "react"
import { X, Minus, Plus } from "lucide-react"
import type { ReadingGoal } from "@lifeboard/types"

type Props = {
  isOpen: boolean
  onClose: () => void
  onCreateGoal: (input: { year: number; month?: number | null; target_count: number }) => void
  onUpdateGoal: (goalId: string, targetCount: number) => void
  yearlyGoal: ReadingGoal | null
  monthlyGoal: ReadingGoal | null
  isPending: boolean
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const ReadingGoalModal = ({
  isOpen,
  onClose,
  onCreateGoal,
  onUpdateGoal,
  yearlyGoal,
  monthlyGoal,
  isPending,
}: Props) => {
  const [tab, setTab] = useState<"yearly" | "monthly">("yearly")
  const [yearlyTarget, setYearlyTarget] = useState(12)
  const [monthlyTarget, setMonthlyTarget] = useState(3)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  const currentYear = new Date().getFullYear()

  useEffect(() => {
    if (yearlyGoal) setYearlyTarget(yearlyGoal.target_count)
    if (monthlyGoal) {
      setMonthlyTarget(monthlyGoal.target_count)
      if (monthlyGoal.month) setSelectedMonth(monthlyGoal.month)
    }
  }, [yearlyGoal, monthlyGoal, isOpen])

  const handleSubmit = () => {
    if (tab === "yearly") {
      if (yearlyGoal) {
        onUpdateGoal(yearlyGoal.id, yearlyTarget)
      } else {
        onCreateGoal({ year: currentYear, target_count: yearlyTarget })
      }
    } else {
      if (monthlyGoal) {
        onUpdateGoal(monthlyGoal.id, monthlyTarget)
      } else {
        onCreateGoal({ year: currentYear, month: selectedMonth, target_count: monthlyTarget })
      }
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(5, 5, 16, 0.75)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
      <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: "rgba(15, 12, 30, 0.85)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", boxShadow: "0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 0 0 1px rgba(108,71,255,0.1)" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "16px", background: "linear-gradient(180deg, rgba(108,71,255,0.06) 0%, transparent 100%)" }}>
          <h2 className="text-lg font-semibold text-white">Reading Goal</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-lg p-1 mb-6">
          {(["yearly", "monthly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                tab === t
                  ? "bg-amber-600 text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {t === "yearly" ? "Yearly" : "Monthly"}
            </button>
          ))}
        </div>

        {tab === "yearly" ? (
          /* Yearly goal */
          <div className="text-center">
            <p className="text-sm text-white/50 mb-4">
              I want to read this many books in {currentYear}
            </p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => setYearlyTarget(Math.max(1, yearlyTarget - 1))}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="text-4xl font-bold text-amber-400 tabular-nums w-16 text-center">
                {yearlyTarget}
              </span>
              <button
                onClick={() => setYearlyTarget(yearlyTarget + 1)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            <p className="text-xs text-white/30">
              That&apos;s about {Math.ceil(yearlyTarget / 12)} book{Math.ceil(yearlyTarget / 12) !== 1 ? "s" : ""} per month
            </p>
          </div>
        ) : (
          /* Monthly goal */
          <div className="text-center">
            {/* Month picker */}
            <div className="mb-4">
              <label className="block text-xs text-white/40 mb-1.5">Month</label>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {MONTHS.map((month, i) => (
                  <button
                    key={month}
                    onClick={() => setSelectedMonth(i + 1)}
                    className={`px-2.5 py-1 rounded-md text-xs transition-all ${
                      selectedMonth === i + 1
                        ? "bg-amber-600 text-white"
                        : "bg-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    {month.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-sm text-white/50 mb-4">
              Books to read in {MONTHS[selectedMonth - 1]} {currentYear}
            </p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={() => setMonthlyTarget(Math.max(1, monthlyTarget - 1))}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="text-4xl font-bold text-amber-400 tabular-nums w-16 text-center">
                {monthlyTarget}
              </span>
              <button
                onClick={() => setMonthlyTarget(monthlyTarget + 1)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 px-4 py-2 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.9), rgba(217,119,6,0.9))", border: "1px solid rgba(245,158,11,0.5)", boxShadow: "0 4px 20px rgba(245,158,11,0.3), inset 0 1px 0 rgba(255,255,255,0.2)" }}
          >
            {isPending ? "Saving..." : yearlyGoal || monthlyGoal ? "Update Goal" : "Set Goal"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReadingGoalModal
