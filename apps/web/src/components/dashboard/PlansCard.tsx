"use client"

import Link from "next/link"
import type { PlanWithProgress } from "@lifeboard/lib"

const TEMPLATE_COLORS: Record<string, string> = {
  content: "#6C47FF",
  event: "#EC4899",
  study: "#3B82F6",
  personal: "#22C55E",
  nysc: "#F59E0B",
  custom: "#8B5CF6",
}

type Props = {
  activePlans: PlanWithProgress[]
}

const PlansCard = ({ activePlans }: Props) => {
  return (
    <div className="relative bg-[#13131F] rounded-2xl border border-white/[0.06] border-l-[3px] border-l-[#3B82F6] p-6 h-full hover:border-[#3B82F6]/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:scale-[1.01] transition-all duration-200 group">
      {/* Floating icon */}
      <span className="absolute top-4 right-4 text-lg opacity-60 animate-float-rotate">
        🗺️
      </span>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
        <h3 className="font-semibold text-white">Plans</h3>
        <Link
          href="/planner"
          className="text-xs text-white/40 hover:text-[#3B82F6] transition-colors"
        >
          View all &rarr;
        </Link>
      </div>

      {/* Plan list */}
      {activePlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-white/30">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3 text-2xl">
            🎯
          </div>
          <p className="text-sm font-medium mb-1">No active plans</p>
          <Link href="/planner" className="text-xs text-[#3B82F6] hover:underline">
            Start planning &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {activePlans.map((plan) => {
            const color =
              TEMPLATE_COLORS[plan.template_type] ?? TEMPLATE_COLORS.custom
            const isOverdue =
              plan.deadline && new Date(plan.deadline) < new Date()

            return (
              <div key={plan.id}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-white truncate flex-1">
                    {plan.title}
                  </span>
                  {plan.is_pinned && (
                    <span className="text-xs text-yellow-400">📌</span>
                  )}
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${plan.progress_percent}%`,
                      backgroundColor:
                        plan.progress_percent === 100 ? "#22C55E" : color,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/30">
                    {plan.completed_tasks} of {plan.total_tasks} tasks
                  </span>
                  {plan.deadline && (
                    <span
                      className={`text-xs ${
                        isOverdue ? "text-red-400" : "text-white/30"
                      }`}
                    >
                      Due{" "}
                      {new Date(plan.deadline).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PlansCard
