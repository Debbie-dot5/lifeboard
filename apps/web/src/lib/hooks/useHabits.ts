"use client"

import { useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import {
  queryKeys,
  fetchTodayHabitStatus,
  logHabit,
  unlogHabit,
  createHabit,
  updateHabit,
  archiveHabit,
  deleteHabit,
  getTodayISO,
} from "@lifeboard/lib"
import type { HabitWithTodayStatus } from "@lifeboard/lib"
import type { Habit, CreateHabitInput } from "@lifeboard/types"

const STREAK_MILESTONES = [7, 30, 100]

const useHabitsHook = (
  userId: string,
  options?: {
    onStreakMilestone?: (days: number, habitName: string) => void
  }
) => {
  const supabase = createClient()
  const queryClient = useQueryClient()

  // ── QUERY ──────────────────────────────────────────────────────────────────
  const {
    data: habits = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.habits.todayStatus(userId),
    queryFn: () => fetchTodayHabitStatus(supabase, userId),
    enabled: !!userId,
  })

  // ── MUTATIONS ──────────────────────────────────────────────────────────────

  const logHabitMutation = useMutation({
    mutationFn: ({ habitId, date }: { habitId: string; date: string }) =>
      logHabit(supabase, habitId, date),

    onMutate: async ({ habitId, date }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.habits.todayStatus(userId) })
      const previous = queryClient.getQueryData<HabitWithTodayStatus[]>(
        queryKeys.habits.todayStatus(userId)
      )

      const habit = previous?.find((h) => h.id === habitId)
      const previousStreak = habit?.current_streak ?? 0

      queryClient.setQueryData<HabitWithTodayStatus[]>(
        queryKeys.habits.todayStatus(userId),
        (old = []) =>
          old.map((h) =>
            h.id === habitId
              ? {
                  ...h,
                  completed_today: true,
                  current_streak: h.current_streak + 1,
                  all_log_dates: [date, ...h.all_log_dates],
                }
              : h
          )
      )

      return { previous, previousStreak, habitId }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.habits.todayStatus(userId), context.previous)
      }
    },
    onSuccess: (_data, { habitId }, context) => {
      if (options?.onStreakMilestone && context) {
        const newStreak = (context.previousStreak ?? 0) + 1
        const habit = habits.find((h) => h.id === habitId)
        if (habit && STREAK_MILESTONES.includes(newStreak)) {
          options.onStreakMilestone(newStreak, habit.name)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.todayStatus(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary(userId) })
    },
  })

  const unlogHabitMutation = useMutation({
    mutationFn: ({ habitId, date }: { habitId: string; date: string }) =>
      unlogHabit(supabase, habitId, date),

    onMutate: async ({ habitId, date }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.habits.todayStatus(userId) })
      const previous = queryClient.getQueryData<HabitWithTodayStatus[]>(
        queryKeys.habits.todayStatus(userId)
      )

      queryClient.setQueryData<HabitWithTodayStatus[]>(
        queryKeys.habits.todayStatus(userId),
        (old = []) =>
          old.map((h) =>
            h.id === habitId
              ? {
                  ...h,
                  completed_today: false,
                  current_streak: Math.max(0, h.current_streak - 1),
                  all_log_dates: h.all_log_dates.filter((d) => d !== date),
                }
              : h
          )
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.habits.todayStatus(userId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.todayStatus(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary(userId) })
    },
  })

  const createHabitMutation = useMutation({
    mutationFn: (input: CreateHabitInput) => createHabit(supabase, userId, input),

    onMutate: async (newHabit) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.habits.todayStatus(userId) })
      const previous = queryClient.getQueryData<HabitWithTodayStatus[]>(
        queryKeys.habits.todayStatus(userId)
      )

      queryClient.setQueryData<HabitWithTodayStatus[]>(
        queryKeys.habits.todayStatus(userId),
        (old = []) => [
          ...old,
          {
            ...newHabit,
            id: `temp-${Date.now()}`,
            user_id: userId,
            is_archived: false,
            created_at: new Date().toISOString(),
            completed_today: false,
            current_streak: 0,
            all_log_dates: [],
          },
        ]
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.habits.todayStatus(userId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.todayStatus(userId) })
    },
  })

  const updateHabitMutation = useMutation({
    mutationFn: ({
      habitId,
      updates,
    }: {
      habitId: string
      updates: Partial<Omit<Habit, "id" | "user_id" | "created_at">>
    }) => updateHabit(supabase, habitId, updates),

    onMutate: async ({ habitId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.habits.todayStatus(userId) })
      const previous = queryClient.getQueryData<HabitWithTodayStatus[]>(
        queryKeys.habits.todayStatus(userId)
      )

      queryClient.setQueryData<HabitWithTodayStatus[]>(
        queryKeys.habits.todayStatus(userId),
        (old = []) => old.map((h) => (h.id === habitId ? { ...h, ...updates } : h))
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.habits.todayStatus(userId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.todayStatus(userId) })
    },
  })

  const archiveHabitMutation = useMutation({
    mutationFn: (habitId: string) => archiveHabit(supabase, habitId),

    onMutate: async (habitId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.habits.todayStatus(userId) })
      const previous = queryClient.getQueryData<HabitWithTodayStatus[]>(
        queryKeys.habits.todayStatus(userId)
      )

      queryClient.setQueryData<HabitWithTodayStatus[]>(
        queryKeys.habits.todayStatus(userId),
        (old = []) => old.map((h) => (h.id === habitId ? { ...h, is_archived: true } : h))
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.habits.todayStatus(userId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.todayStatus(userId) })
    },
  })

  const deleteHabitMutation = useMutation({
    mutationFn: (habitId: string) => deleteHabit(supabase, habitId),

    onMutate: async (habitId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.habits.todayStatus(userId) })
      const previous = queryClient.getQueryData<HabitWithTodayStatus[]>(
        queryKeys.habits.todayStatus(userId)
      )

      queryClient.setQueryData<HabitWithTodayStatus[]>(
        queryKeys.habits.todayStatus(userId),
        (old = []) => old.filter((h) => h.id !== habitId)
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.habits.todayStatus(userId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.todayStatus(userId) })
    },
  })

  // ── COMPUTED ─────────────────────────────────────────────────────────────────
  const activeHabits = useMemo(() => habits.filter((h) => !h.is_archived), [habits])
  const archivedHabits = useMemo(() => habits.filter((h) => h.is_archived), [habits])
  const todayProgress = useMemo(
    () => ({
      total: activeHabits.length,
      completed: activeHabits.filter((h) => h.completed_today).length,
    }),
    [activeHabits]
  )

  return {
    // Data
    habits,
    activeHabits,
    archivedHabits,
    todayProgress,

    // State
    isLoading,
    error,

    // Actions
    logHabit: (habitId: string) =>
      logHabitMutation.mutate({ habitId, date: getTodayISO() }),
    unlogHabit: (habitId: string) =>
      unlogHabitMutation.mutate({ habitId, date: getTodayISO() }),
    createHabit: createHabitMutation.mutate,
    updateHabit: (habitId: string, updates: Partial<Omit<Habit, "id" | "user_id" | "created_at">>) =>
      updateHabitMutation.mutate({ habitId, updates }),
    archiveHabit: archiveHabitMutation.mutate,
    deleteHabit: deleteHabitMutation.mutate,

    // Mutation states
    isCreating: createHabitMutation.isPending,
    isLogging: logHabitMutation.isPending,
    isUpdating: updateHabitMutation.isPending,
  }
}

export default useHabitsHook
