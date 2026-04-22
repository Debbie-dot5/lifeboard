"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Plus, LayoutGrid, Calendar, Pin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import usePlanner from "@/lib/hooks/usePlanner"
import PlanCard from "@/components/modules/planner/PlanCard"
import PlannerCalendarView from "@/components/modules/planner/PlannerCalendarView"
import EditPlanModal from "@/components/modules/planner/EditPlanModal"
import { TEMPLATE_FILTER_OPTIONS } from "@/components/modules/planner/constants"
import type { PlanTemplateType, Plan } from "@lifeboard/types"
import type { PlanWithProgress } from "@lifeboard/lib"

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

const PlannerPage = () => {
  const router = useRouter()
  const { data: user } = useUser()
  const {
    plans,
    pinnedPlans,
    unpinnedPlans,
    isLoading,
    deletePlan,
    togglePin,
    updatePlan,
    isUpdating,
  } = usePlanner(user?.id ?? "")

  const [viewMode, setViewMode] = useState<"board" | "calendar">("board")
  const [templateFilter, setTemplateFilter] = useState<PlanTemplateType | "all">("all")
  const [editingPlan, setEditingPlan] = useState<PlanWithProgress | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const filteredPlans = useMemo(() => {
    if (templateFilter === "all") return plans
    return plans.filter((p) => p.template_type === templateFilter)
  }, [plans, templateFilter])

  const filteredPinned = useMemo(() => {
    if (templateFilter === "all") return pinnedPlans
    return pinnedPlans.filter((p) => p.template_type === templateFilter)
  }, [pinnedPlans, templateFilter])

  const filteredUnpinned = useMemo(() => {
    if (templateFilter === "all") return unpinnedPlans
    return unpinnedPlans.filter((p) => p.template_type === templateFilter)
  }, [unpinnedPlans, templateFilter])

  const handleDelete = (planId: string) => {
    if (!window.confirm("Delete this plan and all its milestones?")) return
    deletePlan(planId)
  }

  const handleEdit = (plan: PlanWithProgress) => {
    setEditingPlan(plan)
    setShowEditModal(true)
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-white/30 text-sm">Loading planner...</div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 pt-20 md:pt-6 lg:pt-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:justify-between gap-3 md:gap-0 mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-white mb-1"
            style={{ fontFamily: "var(--font-clash)", letterSpacing: "-0.03em" }}
          >
            Planner
          </h1>
          <p className="text-white/40 text-sm">
            {plans.length} {plans.length === 1 ? "plan" : "plans"}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* View toggle */}
          <div className="flex bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("board")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "board" ? "bg-[#6C47FF] text-white" : "text-white/40 hover:text-white/60"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "calendar" ? "bg-[#6C47FF] text-white" : "text-white/40 hover:text-white/60"
              }`}
            >
              <Calendar size={16} />
            </button>
          </div>
          <button
            onClick={() => router.push("/planner/new")}
            className="flex items-center justify-center gap-2 px-4 py-2 flex-1 md:flex-none text-white text-sm font-medium rounded-lg transition-all min-h-11"
            style={{ background: "linear-gradient(135deg, rgba(108,71,255,0.9), rgba(79,47,224,0.9))", border: "1px solid rgba(108,71,255,0.5)", boxShadow: "0 4px 20px rgba(108,71,255,0.3), inset 0 1px 0 rgba(255,255,255,0.2)" }}
          >
            <Plus size={16} />
            New Plan
          </button>
        </div>
      </div>

      {/* Template filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6">
        {TEMPLATE_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTemplateFilter(opt.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              templateFilter === opt.value
                ? "text-white"
                : "text-white/40 hover:text-white/60"
            }`}
            style={
              templateFilter === opt.value
                ? { background: "rgba(108,71,255,0.2)", border: "1px solid rgba(108,71,255,0.3)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }
                : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      {viewMode === "calendar" ? (
        <PlannerCalendarView plans={filteredPlans} />
      ) : (
        <>
          {/* Pinned section */}
          {filteredPinned.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Pin size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Pinned
                </span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {filteredPinned.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    wide
                    onEdit={() => handleEdit(plan)}
                    onDelete={() => handleDelete(plan.id)}
                    onTogglePin={() => togglePin(plan.id, !plan.is_pinned)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All plans grid */}
          {filteredUnpinned.length === 0 && filteredPinned.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <p className="text-white/30 text-sm mb-4">No plans yet — start planning</p>
              <button
                onClick={() => router.push("/planner/new")}
                className="px-4 py-2 bg-[#6C47FF] text-white text-sm font-medium rounded-lg hover:bg-[#5835FF] transition-colors"
              >
                New Plan
              </button>
            </div>
          ) : (
            <>
              {filteredUnpinned.length > 0 && (
                <div>
                  {filteredPinned.length > 0 && (
                    <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
                      All Plans
                    </h2>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUnpinned.map((plan) => (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        onEdit={() => handleEdit(plan)}
                        onDelete={() => handleDelete(plan.id)}
                        onTogglePin={() => togglePin(plan.id, !plan.is_pinned)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Edit modal */}
      <EditPlanModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingPlan(null) }}
        onSubmit={() => {}}
        onUpdate={(planId, updates) => updatePlan(planId, updates)}
        editingPlan={editingPlan}
        isPending={isUpdating}
      />
    </div>
  )
}

export default PlannerPage
