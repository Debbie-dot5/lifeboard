"use client"

import { useMemo } from "react"
import { TEMPLATE_CONFIG } from "./constants"
import type { PlanMilestone, PlanTask, PlanTemplateType } from "@lifeboard/types"

type MilestoneWithTasks = PlanMilestone & { plan_tasks: PlanTask[] }

type Props = {
  milestones: MilestoneWithTasks[]
  deadline: string | null
  templateType: PlanTemplateType
  onMilestoneClick?: (milestoneId: string) => void
}

const TimelineView = ({ milestones, deadline, templateType, onMilestoneClick }: Props) => {
  const config = TEMPLATE_CONFIG[templateType] ?? TEMPLATE_CONFIG.custom
  const todayStr = new Date().toISOString().split("T")[0]

  const milestonesWithDates = milestones.filter((m) => m.due_date)

  if (milestonesWithDates.length === 0 && !deadline) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
          <span className="text-xl">📅</span>
        </div>
        <p className="text-white/30 text-sm">Add dates to milestones to see timeline</p>
      </div>
    )
  }

  // Sort milestones by due_date
  const sortedMilestones = [...milestonesWithDates].sort((a, b) =>
    (a.due_date ?? "").localeCompare(b.due_date ?? "")
  )

  // Compute all dates for the axis
  const allDates = [
    ...sortedMilestones.map((m) => m.due_date!),
    ...(deadline ? [deadline] : []),
  ].sort()

  const firstDate = allDates[0]
  const lastDate = allDates[allDates.length - 1]

  const getPosition = (dateStr: string) => {
    const start = new Date(firstDate).getTime()
    const end = new Date(lastDate).getTime()
    const current = new Date(dateStr).getTime()
    if (end === start) return 50
    return ((current - start) / (end - start)) * 100
  }

  const todayPosition = todayStr >= firstDate && todayStr <= lastDate
    ? getPosition(todayStr)
    : null

  return (
    <div className="py-8 px-4">
      {/* Timeline container */}
      <div className="relative min-h-[200px]">
        {/* Axis line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />

        {/* Today marker */}
        {todayPosition !== null && (
          <div
            className="absolute top-0 bottom-0 flex flex-col items-center z-10"
            style={{ left: `${todayPosition}%`, transform: "translateX(-50%)" }}
          >
            <span className="text-[9px] text-[#6C47FF] font-medium mb-1 whitespace-nowrap">Today</span>
            <div className="flex-1 w-px bg-[#6C47FF]/40 border-l border-dashed border-[#6C47FF]/40" />
          </div>
        )}

        {/* Milestone markers */}
        {sortedMilestones.map((milestone, i) => {
          const pos = getPosition(milestone.due_date!)
          const completedTasks = milestone.plan_tasks.filter((t) => t.is_complete).length
          const totalTasks = milestone.plan_tasks.length
          const isAbove = i % 2 === 0

          return (
            <div
              key={milestone.id}
              className="absolute flex flex-col items-center cursor-pointer group"
              style={{
                left: `${pos}%`,
                transform: "translateX(-50%)",
                top: isAbove ? "0" : "50%",
                bottom: isAbove ? "50%" : "0",
              }}
              onClick={() => onMilestoneClick?.(milestone.id)}
            >
              {isAbove ? (
                <>
                  <div className="text-center mb-1">
                    <p className="text-[10px] text-white/60 font-medium group-hover:text-white transition-colors whitespace-nowrap">
                      {milestone.title}
                    </p>
                    <p className="text-[9px] text-white/30">
                      {new Date(milestone.due_date! + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    {totalTasks > 0 && (
                      <p className="text-[9px] text-white/20">{completedTasks}/{totalTasks}</p>
                    )}
                  </div>
                  <div className="flex-1 w-px bg-white/10" />
                  <div
                    className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                      milestone.is_complete
                        ? "bg-[#6C47FF] border-[#6C47FF]"
                        : "bg-[#0F0F1A] border-white/20 border-dashed"
                    }`}
                  />
                </>
              ) : (
                <>
                  <div
                    className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                      milestone.is_complete
                        ? "bg-[#6C47FF] border-[#6C47FF]"
                        : "bg-[#0F0F1A] border-white/20 border-dashed"
                    }`}
                  />
                  <div className="flex-1 w-px bg-white/10" />
                  <div className="text-center mt-1">
                    <p className="text-[10px] text-white/60 font-medium group-hover:text-white transition-colors whitespace-nowrap">
                      {milestone.title}
                    </p>
                    <p className="text-[9px] text-white/30">
                      {new Date(milestone.due_date! + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    {totalTasks > 0 && (
                      <p className="text-[9px] text-white/20">{completedTasks}/{totalTasks}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}

        {/* Deadline marker */}
        {deadline && (
          <div
            className="absolute flex flex-col items-center"
            style={{ left: `${getPosition(deadline)}%`, transform: "translateX(-50%)", top: "0", bottom: "0" }}
          >
            <span className="text-[9px] text-red-400 font-medium mb-1 whitespace-nowrap">Deadline</span>
            <div className="flex-1 w-px bg-red-400/30" />
            <div className="w-3 h-3 rounded-full bg-red-400 flex-shrink-0" />
            <div className="flex-1 w-px bg-red-400/30" />
            <span className="text-[9px] text-white/30 mt-1">
              {new Date(deadline + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default TimelineView
