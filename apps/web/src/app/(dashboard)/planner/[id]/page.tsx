"use client"

import { useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  Pin,
  MoreVertical,
  Pencil,
  Trash2,
  Kanban,
  GitBranchPlus,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import usePlan from "@/lib/hooks/usePlan"
import KanbanBoard from "@/components/modules/planner/KanbanBoard"
import TimelineView from "@/components/modules/planner/TimelineView"
import EditPlanModal from "@/components/modules/planner/EditPlanModal"
import { TEMPLATE_CONFIG } from "@/components/modules/planner/constants"

const useUser = () => {
  const supabase = createClient()
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },
  })
}

const PlanDetailPage = () => {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { data: user } = useUser()
  const {
    plan,
    isLoading,
    progressPercent,
    totalTasks,
    completedTasks,
    updatePlan,
    deletePlan,
    togglePin,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    createPlanTask,
    updatePlanTask,
    deletePlanTask,
    togglePlanTask,
    isUpdating,
  } = usePlan(user?.id ?? "", id)

  const [viewMode, setViewMode] = useState<"kanban" | "timeline">("kanban")
  const [showEditModal, setShowEditModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [editGoal, setEditGoal] = useState("")

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-white/30 text-sm">Loading plan...</div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full">
        <p className="text-white/30 text-sm mb-4">Plan not found</p>
        <button
          onClick={() => router.push("/planner")}
          className="text-sm text-[#6C47FF] hover:underline"
        >
          Back to Planner
        </button>
      </div>
    )
  }

  const config = TEMPLATE_CONFIG[plan.template_type] ?? TEMPLATE_CONFIG.custom
  const isOverdue =
    plan.deadline && new Date(plan.deadline) < new Date() && progressPercent < 100

  const formattedDeadline = plan.deadline
    ? new Date(plan.deadline + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null

  const handleSaveTitle = () => {
    const trimmed = editTitle.trim()
    if (trimmed && trimmed !== plan.title) {
      updatePlan({ title: trimmed })
    }
    setIsEditingTitle(false)
  }

  const handleSaveGoal = () => {
    const trimmed = editGoal.trim()
    if (trimmed !== (plan.goal ?? "")) {
      updatePlan({ goal: trimmed || null })
    }
    setIsEditingGoal(false)
  }

  const handleDelete = async () => {
    if (!window.confirm("Delete this plan and all its milestones and tasks?")) return
    await deletePlan()
    router.push("/planner")
  }

  return (
    <div className="p-8 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        {/* Back + actions */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => router.push("/planner")}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex bg-white/5 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  viewMode === "kanban" ? "bg-[#6C47FF] text-white" : "text-white/40 hover:text-white/60"
                }`}
              >
                <Kanban size={14} />
                Kanban
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                  viewMode === "timeline" ? "bg-[#6C47FF] text-white" : "text-white/40 hover:text-white/60"
                }`}
              >
                <GitBranchPlus size={14} />
                Timeline
              </button>
            </div>

            {/* Pin button */}
            <button
              onClick={() => togglePin(!plan.is_pinned)}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Pin
                size={16}
                className={plan.is_pinned ? "text-yellow-400 fill-yellow-400" : "text-white/20"}
              />
            </button>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <MoreVertical size={16} className="text-white/30" />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-10 z-20 bg-[#1A1A2E] border border-white/10 rounded-lg shadow-xl py-1 min-w-[140px]">
                    <button
                      onClick={() => { setShowMenu(false); setShowEditModal(true) }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Pencil size={12} />
                      Edit Details
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); handleDelete() }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400/60 hover:bg-white/5 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />
                      Delete Plan
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Template badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">{config.icon}</span>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: config.color + "20", color: config.color }}
          >
            {config.label}
          </span>
          {formattedDeadline && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isOverdue ? "bg-red-500/10 text-red-400" : "bg-white/5 text-white/40"
            }`}>
              {isOverdue ? "Overdue: " : ""}{formattedDeadline}
            </span>
          )}
        </div>

        {/* Title (inline editable) */}
        {isEditingTitle ? (
          <input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveTitle()
              if (e.key === "Escape") setIsEditingTitle(false)
            }}
            className="text-xl font-bold text-white bg-transparent outline-none border-b-2 border-[#6C47FF] pb-1 w-full mb-1"
          />
        ) : (
          <h1
            onClick={() => { setEditTitle(plan.title); setIsEditingTitle(true) }}
            className="text-xl font-bold text-white cursor-text mb-1"
          >
            {plan.title}
          </h1>
        )}

        {/* Goal (inline editable) */}
        {isEditingGoal ? (
          <textarea
            autoFocus
            value={editGoal}
            onChange={(e) => setEditGoal(e.target.value)}
            onBlur={handleSaveGoal}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsEditingGoal(false)
            }}
            rows={2}
            className="text-sm text-white/50 bg-transparent outline-none border-b border-[#6C47FF]/50 pb-1 w-full resize-none mb-2"
          />
        ) : (
          <p
            onClick={() => { setEditGoal(plan.goal ?? ""); setIsEditingGoal(true) }}
            className="text-sm text-white/40 cursor-text mb-3 min-h-[20px]"
          >
            {plan.goal || "Click to add a goal..."}
          </p>
        )}

        {/* Progress bar */}
        <div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: progressPercent === 100 ? "#22C55E" : "#6C47FF",
              }}
            />
          </div>
          <p className="text-[10px] text-white/30 mt-1">
            {completedTasks} of {totalTasks} tasks done ({progressPercent}%)
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {viewMode === "kanban" ? (
          <KanbanBoard
            milestones={plan.plan_milestones}
            onCreateMilestone={createMilestone}
            onUpdateMilestone={updateMilestone}
            onDeleteMilestone={deleteMilestone}
            onCreateTask={createPlanTask}
            onUpdateTask={updatePlanTask}
            onDeleteTask={deletePlanTask}
            onToggleTask={togglePlanTask}
          />
        ) : (
          <TimelineView
            milestones={plan.plan_milestones}
            deadline={plan.deadline}
            templateType={plan.template_type}
          />
        )}
      </div>

      {/* Edit Plan Modal */}
      <EditPlanModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={() => {}}
        onUpdate={(_, updates) => updatePlan(updates)}
        editingPlan={plan}
        isPending={isUpdating}
      />
    </div>
  )
}

export default PlanDetailPage
