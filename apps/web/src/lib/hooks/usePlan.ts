"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import {
  queryKeys,
  fetchPlan as fetchPlanQuery,
  updatePlan as updatePlanQuery,
  deletePlan as deletePlanQuery,
  togglePinPlan as togglePinPlanQuery,
  createMilestone as createMilestoneQuery,
  updateMilestone as updateMilestoneQuery,
  deleteMilestone as deleteMilestoneQuery,
  createPlanTask as createPlanTaskQuery,
  updatePlanTask as updatePlanTaskQuery,
  deletePlanTask as deletePlanTaskQuery,
  togglePlanTask as togglePlanTaskQuery,
} from "@lifeboard/lib"
import type { Plan, PlanMilestone, PlanTask } from "@lifeboard/types"
import type { PlanDetail } from "@lifeboard/lib"

const usePlan = (userId: string, planId: string) => {
  const supabase = createClient()
  const queryClient = useQueryClient()

  // ── QUERY ────────────────────────────────────────────────────────────────

  const { data: plan, isLoading, error } = useQuery({
    queryKey: queryKeys.plans.plan(userId, planId),
    queryFn: () => fetchPlanQuery(supabase, planId),
    enabled: !!userId && !!planId,
  })

  // ── COMPUTED ─────────────────────────────────────────────────────────────

  const allTasks = plan?.plan_milestones.flatMap((m) => m.plan_tasks) ?? []
  const completedTasks = allTasks.filter((t) => t.is_complete)
  const progressPercent =
    allTasks.length > 0
      ? Math.round((completedTasks.length / allTasks.length) * 100)
      : 0

  // ── INVALIDATION HELPER ──────────────────────────────────────────────────

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.plans.plan(userId, planId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.plans.all(userId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary(userId) })
  }

  // ── PLAN MUTATIONS ───────────────────────────────────────────────────────

  const updatePlanMutation = useMutation({
    mutationFn: (updates: Partial<Omit<Plan, "id" | "user_id" | "created_at">>) =>
      updatePlanQuery(supabase, planId, updates),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.plans.plan(userId, planId) })
      const previous = queryClient.getQueryData<PlanDetail>(queryKeys.plans.plan(userId, planId))
      queryClient.setQueryData<PlanDetail>(queryKeys.plans.plan(userId, planId), (old) =>
        old ? { ...old, ...updates } : old
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.plans.plan(userId, planId), context.previous)
      }
    },
    onSettled: () => invalidateAll(),
  })

  const deletePlanMutation = useMutation({
    mutationFn: () => deletePlanQuery(supabase, planId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plans.all(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary(userId) })
    },
  })

  const togglePinMutation = useMutation({
    mutationFn: (isPinned: boolean) => togglePinPlanQuery(supabase, planId, isPinned),
    onMutate: async (isPinned) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.plans.plan(userId, planId) })
      const previous = queryClient.getQueryData<PlanDetail>(queryKeys.plans.plan(userId, planId))
      queryClient.setQueryData<PlanDetail>(queryKeys.plans.plan(userId, planId), (old) =>
        old ? { ...old, is_pinned: isPinned } : old
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.plans.plan(userId, planId), context.previous)
      }
    },
    onSettled: () => invalidateAll(),
  })

  // ── MILESTONE MUTATIONS ──────────────────────────────────────────────────

  const createMilestoneMutation = useMutation({
    mutationFn: (input: { title: string; order_index: number; due_date?: string | null }) =>
      createMilestoneQuery(supabase, { ...input, plan_id: planId }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.plans.plan(userId, planId) })
      const previous = queryClient.getQueryData<PlanDetail>(queryKeys.plans.plan(userId, planId))
      queryClient.setQueryData<PlanDetail>(queryKeys.plans.plan(userId, planId), (old) => {
        if (!old) return old
        return {
          ...old,
          plan_milestones: [
            ...old.plan_milestones,
            {
              id: `temp-${Date.now()}`,
              plan_id: planId,
              title: input.title,
              is_complete: false,
              order_index: input.order_index,
              due_date: input.due_date ?? null,
              plan_tasks: [],
            },
          ],
        }
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.plans.plan(userId, planId), context.previous)
      }
    },
    onSettled: () => invalidateAll(),
  })

  const updateMilestoneMutation = useMutation({
    mutationFn: ({
      milestoneId,
      updates,
    }: {
      milestoneId: string
      updates: Partial<Omit<PlanMilestone, "id" | "plan_id">>
    }) => updateMilestoneQuery(supabase, milestoneId, updates),
    onMutate: async ({ milestoneId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.plans.plan(userId, planId) })
      const previous = queryClient.getQueryData<PlanDetail>(queryKeys.plans.plan(userId, planId))
      queryClient.setQueryData<PlanDetail>(queryKeys.plans.plan(userId, planId), (old) => {
        if (!old) return old
        return {
          ...old,
          plan_milestones: old.plan_milestones.map((m) =>
            m.id === milestoneId ? { ...m, ...updates } : m
          ),
        }
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.plans.plan(userId, planId), context.previous)
      }
    },
    onSettled: () => invalidateAll(),
  })

  const deleteMilestoneMutation = useMutation({
    mutationFn: (milestoneId: string) => deleteMilestoneQuery(supabase, milestoneId),
    onMutate: async (milestoneId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.plans.plan(userId, planId) })
      const previous = queryClient.getQueryData<PlanDetail>(queryKeys.plans.plan(userId, planId))
      queryClient.setQueryData<PlanDetail>(queryKeys.plans.plan(userId, planId), (old) => {
        if (!old) return old
        return {
          ...old,
          plan_milestones: old.plan_milestones.filter((m) => m.id !== milestoneId),
        }
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.plans.plan(userId, planId), context.previous)
      }
    },
    onSettled: () => invalidateAll(),
  })

  // ── TASK MUTATIONS ───────────────────────────────────────────────────────

  const createTaskMutation = useMutation({
    mutationFn: (input: { milestone_id: string; title: string; order_index: number }) =>
      createPlanTaskQuery(supabase, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.plans.plan(userId, planId) })
      const previous = queryClient.getQueryData<PlanDetail>(queryKeys.plans.plan(userId, planId))
      queryClient.setQueryData<PlanDetail>(queryKeys.plans.plan(userId, planId), (old) => {
        if (!old) return old
        return {
          ...old,
          plan_milestones: old.plan_milestones.map((m) =>
            m.id === input.milestone_id
              ? {
                  ...m,
                  plan_tasks: [
                    ...m.plan_tasks,
                    {
                      id: `temp-${Date.now()}`,
                      milestone_id: input.milestone_id,
                      title: input.title,
                      is_complete: false,
                      order_index: input.order_index,
                    },
                  ],
                }
              : m
          ),
        }
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.plans.plan(userId, planId), context.previous)
      }
    },
    onSettled: () => invalidateAll(),
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      updates,
    }: {
      taskId: string
      updates: Partial<Omit<PlanTask, "id" | "milestone_id">>
    }) => updatePlanTaskQuery(supabase, taskId, updates),
    onMutate: async ({ taskId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.plans.plan(userId, planId) })
      const previous = queryClient.getQueryData<PlanDetail>(queryKeys.plans.plan(userId, planId))
      queryClient.setQueryData<PlanDetail>(queryKeys.plans.plan(userId, planId), (old) => {
        if (!old) return old
        return {
          ...old,
          plan_milestones: old.plan_milestones.map((m) => ({
            ...m,
            plan_tasks: m.plan_tasks.map((t) =>
              t.id === taskId ? { ...t, ...updates } : t
            ),
          })),
        }
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.plans.plan(userId, planId), context.previous)
      }
    },
    onSettled: () => invalidateAll(),
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => deletePlanTaskQuery(supabase, taskId),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.plans.plan(userId, planId) })
      const previous = queryClient.getQueryData<PlanDetail>(queryKeys.plans.plan(userId, planId))
      queryClient.setQueryData<PlanDetail>(queryKeys.plans.plan(userId, planId), (old) => {
        if (!old) return old
        return {
          ...old,
          plan_milestones: old.plan_milestones.map((m) => ({
            ...m,
            plan_tasks: m.plan_tasks.filter((t) => t.id !== taskId),
          })),
        }
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.plans.plan(userId, planId), context.previous)
      }
    },
    onSettled: () => invalidateAll(),
  })

  const toggleTaskMutation = useMutation({
    mutationFn: ({ taskId, isComplete }: { taskId: string; isComplete: boolean }) =>
      togglePlanTaskQuery(supabase, taskId, isComplete),
    onMutate: async ({ taskId, isComplete }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.plans.plan(userId, planId) })
      const previous = queryClient.getQueryData<PlanDetail>(queryKeys.plans.plan(userId, planId))
      queryClient.setQueryData<PlanDetail>(queryKeys.plans.plan(userId, planId), (old) => {
        if (!old) return old
        return {
          ...old,
          plan_milestones: old.plan_milestones.map((m) => ({
            ...m,
            plan_tasks: m.plan_tasks.map((t) =>
              t.id === taskId ? { ...t, is_complete: isComplete } : t
            ),
          })),
        }
      })
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.plans.plan(userId, planId), context.previous)
      }
    },
    onSettled: () => invalidateAll(),
  })

  return {
    // Data
    plan,
    progressPercent,
    totalTasks: allTasks.length,
    completedTasks: completedTasks.length,

    // State
    isLoading,
    error,

    // Plan actions
    updatePlan: updatePlanMutation.mutate,
    deletePlan: deletePlanMutation.mutateAsync,
    togglePin: (isPinned: boolean) => togglePinMutation.mutate(isPinned),

    // Milestone actions
    createMilestone: createMilestoneMutation.mutate,
    updateMilestone: (
      milestoneId: string,
      updates: Partial<Omit<PlanMilestone, "id" | "plan_id">>
    ) => updateMilestoneMutation.mutate({ milestoneId, updates }),
    deleteMilestone: deleteMilestoneMutation.mutate,

    // Task actions
    createPlanTask: createTaskMutation.mutate,
    updatePlanTask: (
      taskId: string,
      updates: Partial<Omit<PlanTask, "id" | "milestone_id">>
    ) => updateTaskMutation.mutate({ taskId, updates }),
    deletePlanTask: deleteTaskMutation.mutate,
    togglePlanTask: (taskId: string, isComplete: boolean) =>
      toggleTaskMutation.mutate({ taskId, isComplete }),

    // Mutation states
    isUpdating: updatePlanMutation.isPending,
    isDeleting: deletePlanMutation.isPending,
    isCreatingMilestone: createMilestoneMutation.isPending,
    isCreatingTask: createTaskMutation.isPending,
  }
}

export default usePlan
