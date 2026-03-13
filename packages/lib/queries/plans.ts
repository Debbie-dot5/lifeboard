import type { SupabaseClient } from "@supabase/supabase-js"
import type {
  Plan,
  PlanMilestone,
  PlanTask,
  CreatePlanInput,
} from "@lifeboard/types"

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type PlanWithProgress = Plan & {
  milestone_count: number
  progress_percent: number
  total_tasks: number
  completed_tasks: number
}

export type PlanDetail = Plan & {
  plan_milestones: (PlanMilestone & {
    plan_tasks: PlanTask[]
  })[]
}

// ─── FETCH ───────────────────────────────────────────────────────────────────

export const fetchPlans = async (
  supabase: SupabaseClient,
  userId: string
): Promise<PlanWithProgress[]> => {
  const { data, error } = await supabase
    .from("plans")
    .select("*, plan_milestones(id, is_complete, plan_tasks(id, is_complete))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((plan: any) => {
    const milestones = plan.plan_milestones ?? []
    const allTasks = milestones.flatMap((m: any) => m.plan_tasks ?? [])
    const completedTasks = allTasks.filter((t: any) => t.is_complete)

    return {
      id: plan.id,
      user_id: plan.user_id,
      title: plan.title,
      goal: plan.goal,
      deadline: plan.deadline,
      template_type: plan.template_type,
      is_pinned: plan.is_pinned,
      created_at: plan.created_at,
      milestone_count: milestones.length,
      total_tasks: allTasks.length,
      completed_tasks: completedTasks.length,
      progress_percent:
        allTasks.length > 0
          ? Math.round((completedTasks.length / allTasks.length) * 100)
          : 0,
    }
  })
}

export const fetchPlan = async (
  supabase: SupabaseClient,
  planId: string
): Promise<PlanDetail> => {
  const { data, error } = await supabase
    .from("plans")
    .select("*, plan_milestones(*, plan_tasks(*))")
    .eq("id", planId)
    .single()

  if (error) throw new Error(error.message)

  // Sort milestones and tasks by order_index
  const milestones = (data.plan_milestones ?? [])
    .sort((a: any, b: any) => a.order_index - b.order_index)
    .map((m: any) => ({
      ...m,
      plan_tasks: (m.plan_tasks ?? []).sort(
        (a: any, b: any) => a.order_index - b.order_index
      ),
    }))

  return { ...data, plan_milestones: milestones }
}

// ─── PLAN MUTATIONS ──────────────────────────────────────────────────────────

export const createPlan = async (
  supabase: SupabaseClient,
  userId: string,
  input: CreatePlanInput
): Promise<Plan> => {
  const { data, error } = await supabase
    .from("plans")
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const updatePlan = async (
  supabase: SupabaseClient,
  planId: string,
  updates: Partial<Omit<Plan, "id" | "user_id" | "created_at">>
): Promise<Plan> => {
  const { data, error } = await supabase
    .from("plans")
    .update(updates)
    .eq("id", planId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const deletePlan = async (
  supabase: SupabaseClient,
  planId: string
): Promise<void> => {
  const { error } = await supabase
    .from("plans")
    .delete()
    .eq("id", planId)

  if (error) throw new Error(error.message)
}

export const togglePinPlan = async (
  supabase: SupabaseClient,
  planId: string,
  isPinned: boolean
): Promise<Plan> => {
  const { data, error } = await supabase
    .from("plans")
    .update({ is_pinned: isPinned })
    .eq("id", planId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ─── MILESTONE MUTATIONS ─────────────────────────────────────────────────────

export const createMilestone = async (
  supabase: SupabaseClient,
  input: { plan_id: string; title: string; order_index: number; due_date?: string | null }
): Promise<PlanMilestone> => {
  const { data, error } = await supabase
    .from("plan_milestones")
    .insert(input)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const updateMilestone = async (
  supabase: SupabaseClient,
  milestoneId: string,
  updates: Partial<Omit<PlanMilestone, "id" | "plan_id">>
): Promise<PlanMilestone> => {
  const { data, error } = await supabase
    .from("plan_milestones")
    .update(updates)
    .eq("id", milestoneId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const deleteMilestone = async (
  supabase: SupabaseClient,
  milestoneId: string
): Promise<void> => {
  const { error } = await supabase
    .from("plan_milestones")
    .delete()
    .eq("id", milestoneId)

  if (error) throw new Error(error.message)
}

// ─── TASK MUTATIONS ──────────────────────────────────────────────────────────

export const createPlanTask = async (
  supabase: SupabaseClient,
  input: { milestone_id: string; title: string; order_index: number }
): Promise<PlanTask> => {
  const { data, error } = await supabase
    .from("plan_tasks")
    .insert(input)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const updatePlanTask = async (
  supabase: SupabaseClient,
  taskId: string,
  updates: Partial<Omit<PlanTask, "id" | "milestone_id">>
): Promise<PlanTask> => {
  const { data, error } = await supabase
    .from("plan_tasks")
    .update(updates)
    .eq("id", taskId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const deletePlanTask = async (
  supabase: SupabaseClient,
  taskId: string
): Promise<void> => {
  const { error } = await supabase
    .from("plan_tasks")
    .delete()
    .eq("id", taskId)

  if (error) throw new Error(error.message)
}

export const togglePlanTask = async (
  supabase: SupabaseClient,
  taskId: string,
  isComplete: boolean
): Promise<PlanTask> => {
  const { data, error } = await supabase
    .from("plan_tasks")
    .update({ is_complete: isComplete })
    .eq("id", taskId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
