"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pin, MoreVertical, Trash2, Pencil } from "lucide-react"
import { TEMPLATE_CONFIG } from "./constants"
import type { PlanWithProgress } from "@lifeboard/lib"

type Props = {
  plan: PlanWithProgress
  onEdit: () => void
  onDelete: () => void
  onTogglePin: () => void
  wide?: boolean
}

const PlanCard = ({ plan, onEdit, onDelete, onTogglePin, wide }: Props) => {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const config = TEMPLATE_CONFIG[plan.template_type] ?? TEMPLATE_CONFIG.custom

  const isOverdue =
    plan.deadline && new Date(plan.deadline) < new Date() && plan.progress_percent < 100

  const formattedDeadline = plan.deadline
    ? new Date(plan.deadline + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null

  return (
    <div
      onClick={() => router.push(`/planner/${plan.id}`)}
      className={`group relative bg-[#13131F] border border-white/5 rounded-xl p-4 cursor-pointer
        hover:border-[#6C47FF]/30 hover:shadow-[0_0_20px_rgba(108,71,255,0.08)] transition-all duration-200
        ${wide ? "min-w-[320px] max-w-[360px]" : ""}`}
      style={{ borderLeftColor: config.color, borderLeftWidth: "3px" }}
    >
      {/* Template badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs">{config.icon}</span>
        <span
          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: config.color + "20", color: config.color }}
        >
          {config.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1">{plan.title}</h3>

      {/* Goal */}
      {plan.goal && (
        <p className="text-xs text-white/40 mb-3 line-clamp-1">{plan.goal}</p>
      )}

      {/* Progress bar */}
      <div className="mb-2">
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${plan.progress_percent}%`,
              backgroundColor: plan.progress_percent === 100 ? "#22C55E" : "#6C47FF",
            }}
          />
        </div>
        <p className="text-[10px] text-white/30 mt-1">
          {plan.completed_tasks} of {plan.total_tasks} tasks done
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        {formattedDeadline ? (
          <span className={`text-[10px] ${isOverdue ? "text-red-400" : "text-white/30"}`}>
            {isOverdue ? "Overdue: " : ""}{formattedDeadline}
          </span>
        ) : (
          <span className="text-[10px] text-white/20">No deadline</span>
        )}

        <div className="flex items-center gap-1">
          {/* Pin button */}
          <button
            onClick={(e) => { e.stopPropagation(); onTogglePin() }}
            className="p-1 rounded-md hover:bg-white/5 transition-colors"
          >
            <Pin
              size={14}
              className={plan.is_pinned ? "text-yellow-400 fill-yellow-400" : "text-white/20"}
            />
          </button>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
              className="p-1 rounded-md hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical size={14} className="text-white/30" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false) }} />
                <div className="absolute right-0 top-7 z-20 bg-[#1A1A2E] border border-white/10 rounded-lg shadow-xl py-1 min-w-[120px]">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit() }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete() }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-400/60 hover:bg-white/5 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanCard
