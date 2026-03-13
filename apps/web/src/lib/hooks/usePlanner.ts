"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import {
  queryKeys,
  fetchPlans,
  createPlan as createPlanQuery,
  updatePlan as updatePlanQuery,
  deletePlan as deletePlanQuery,
  togglePinPlan,
} from "@lifeboard/lib"
import type { Plan, CreatePlanInput } from "@lifeboard/types"
import type { PlanWithProgress } from "@lifeboard/lib"

const usePlanner = (userId: string) => {
  const supabase = createClient()
  const queryClient = useQueryClient()

  // ── QUERY ────────────────────────────────────────────────────────────────

  const { data: plans = [], isLoading, error } = useQuery({
    queryKey: queryKeys.plans.all(userId),
    queryFn: () => fetchPlans(supabase, userId),
    enabled: !!userId,
  })

  // ── DERIVED STATE ────────────────────────────────────────────────────────

  const pinnedPlans = plans.filter((p) => p.is_pinned)
  const unpinnedPlans = plans.filter((p) => !p.is_pinned)

  // ── INVALIDATION HELPER ──────────────────────────────────────────────────

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.plans.all(userId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary(userId) })
  }

  // ── MUTATIONS ────────────────────────────────────────────────────────────

  const createPlanMutation = useMutation({
    mutationFn: (input: CreatePlanInput) => createPlanQuery(supabase, userId, input),
    onMutate: async (newPlan) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.plans.all(userId) })
      const previous = queryClient.getQueryData<PlanWithProgress[]>(queryKeys.plans.all(userId))
      queryClient.setQueryData<PlanWithProgress[]>(queryKeys.plans.all(userId), (old = []) => [
        {
          ...newPlan,
          id: `temp-${Date.now()}`,
          user_id: userId,
          created_at: new Date().toISOString(),
          milestone_count: 0,
          total_tasks: 0,
          completed_tasks: 0,
          progress_percent: 0,
          goal: newPlan.goal ?? null,
          deadline: newPlan.deadline ?? null,
          is_pinned: newPlan.is_pinned ?? false,
        },
        ...old,
      ])
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.plans.all(userId), context.previous)
      }
    },
    onSettled: () => invalidateAll(),
  })

  const updatePlanMutation = useMutation({
    mutationFn: ({
      planId,
      updates,
    }: {
      planId: string
      updates: Partial<Omit<Plan, "id" | "user_id" | "created_at">>
    }) => updatePlanQuery(supabase, planId, updates),
    onMutate: async ({ planId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.plans.all(userId) })
      const previous = queryClient.getQueryData<PlanWithProgress[]>(queryKeys.plans.all(userId))
      queryClient.setQueryData<PlanWithProgress[]>(queryKeys.plans.all(userId), (old = []) =>
        old.map((p) => (p.id === planId ? { ...p, ...updates } : p))
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.plans.all(userId), context.previous)
      }
    },
    onSettled: () => invalidateAll(),
  })

  const deletePlanMutation = useMutation({
    mutationFn: (planId: string) => deletePlanQuery(supabase, planId),
    onMutate: async (planId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.plans.all(userId) })
      const previous = queryClient.getQueryData<PlanWithProgress[]>(queryKeys.plans.all(userId))
      queryClient.setQueryData<PlanWithProgress[]>(queryKeys.plans.all(userId), (old = []) =>
        old.filter((p) => p.id !== planId)
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.plans.all(userId), context.previous)
      }
    },
    onSettled: () => invalidateAll(),
  })

  const togglePinMutation = useMutation({
    mutationFn: ({ planId, isPinned }: { planId: string; isPinned: boolean }) =>
      togglePinPlan(supabase, planId, isPinned),
    onMutate: async ({ planId, isPinned }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.plans.all(userId) })
      const previous = queryClient.getQueryData<PlanWithProgress[]>(queryKeys.plans.all(userId))
      queryClient.setQueryData<PlanWithProgress[]>(queryKeys.plans.all(userId), (old = []) =>
        old.map((p) => (p.id === planId ? { ...p, is_pinned: isPinned } : p))
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.plans.all(userId), context.previous)
      }
    },
    onSettled: () => invalidateAll(),
  })

  return {
    // Data
    plans,
    pinnedPlans,
    unpinnedPlans,

    // State
    isLoading,
    error,

    // Actions
    createPlan: createPlanMutation.mutateAsync,
    updatePlan: (
      planId: string,
      updates: Partial<Omit<Plan, "id" | "user_id" | "created_at">>
    ) => updatePlanMutation.mutate({ planId, updates }),
    deletePlan: deletePlanMutation.mutate,
    togglePin: (planId: string, isPinned: boolean) =>
      togglePinMutation.mutate({ planId, isPinned }),

    // Mutation states
    isCreating: createPlanMutation.isPending,
    isUpdating: updatePlanMutation.isPending,
    isDeleting: deletePlanMutation.isPending,
  }
}

export default usePlanner
