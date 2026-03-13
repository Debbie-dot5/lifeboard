"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import {
  queryKeys,
  fetchReminders,
  fetchUpcomingReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  toggleReminderActive,
} from "@lifeboard/lib"
import type { Reminder, CreateReminderInput, ReminderType } from "@lifeboard/types"

const useRemindersHook = (userId: string) => {
  const supabase = createClient()
  const queryClient = useQueryClient()

  // ── QUERIES ─────────────────────────────────────────────────────────────────

  const {
    data: reminders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.reminders.all(userId),
    queryFn: () => fetchReminders(supabase, userId),
    enabled: !!userId,
  })

  const { data: upcomingReminders = [] } = useQuery({
    queryKey: queryKeys.reminders.upcoming(userId),
    queryFn: () => fetchUpcomingReminders(supabase, userId),
    enabled: !!userId,
  })

  // ── DERIVED ─────────────────────────────────────────────────────────────────

  const remindersByType = reminders.reduce(
    (acc, r) => {
      if (!acc[r.type]) acc[r.type] = []
      acc[r.type].push(r)
      return acc
    },
    {} as Record<ReminderType, Reminder[]>
  )

  const activeReminders = reminders.filter((r) => r.is_active)
  const upcomingCount = upcomingReminders.length

  // ── INVALIDATE HELPER ───────────────────────────────────────────────────────

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.reminders.all(userId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.reminders.upcoming(userId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary(userId) })
  }

  // ── MUTATIONS ───────────────────────────────────────────────────────────────

  const createReminderMutation = useMutation({
    mutationFn: (input: CreateReminderInput) =>
      createReminder(supabase, userId, input),

    onMutate: async (newReminder) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.reminders.all(userId) })
      const previous = queryClient.getQueryData<Reminder[]>(queryKeys.reminders.all(userId))

      queryClient.setQueryData<Reminder[]>(queryKeys.reminders.all(userId), (old = []) => [
        ...old,
        {
          ...newReminder,
          id: `temp-${Date.now()}`,
          user_id: userId,
          created_at: new Date().toISOString(),
        },
      ])

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.reminders.all(userId), context.previous)
      }
    },
    onSettled: () => invalidateAll(),
  })

  const updateReminderMutation = useMutation({
    mutationFn: ({
      reminderId,
      updates,
    }: {
      reminderId: string
      updates: Partial<Omit<Reminder, "id" | "user_id" | "created_at">>
    }) => updateReminder(supabase, reminderId, updates),

    onMutate: async ({ reminderId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.reminders.all(userId) })
      const previous = queryClient.getQueryData<Reminder[]>(queryKeys.reminders.all(userId))

      queryClient.setQueryData<Reminder[]>(queryKeys.reminders.all(userId), (old = []) =>
        old.map((r) => (r.id === reminderId ? { ...r, ...updates } : r))
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.reminders.all(userId), context.previous)
      }
    },
    onSettled: () => invalidateAll(),
  })

  const deleteReminderMutation = useMutation({
    mutationFn: (reminderId: string) => deleteReminder(supabase, reminderId),

    onMutate: async (reminderId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.reminders.all(userId) })
      const previous = queryClient.getQueryData<Reminder[]>(queryKeys.reminders.all(userId))

      queryClient.setQueryData<Reminder[]>(queryKeys.reminders.all(userId), (old = []) =>
        old.filter((r) => r.id !== reminderId)
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.reminders.all(userId), context.previous)
      }
    },
    onSettled: () => invalidateAll(),
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ reminderId, isActive }: { reminderId: string; isActive: boolean }) =>
      toggleReminderActive(supabase, reminderId, isActive),

    onMutate: async ({ reminderId, isActive }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.reminders.all(userId) })
      const previous = queryClient.getQueryData<Reminder[]>(queryKeys.reminders.all(userId))

      queryClient.setQueryData<Reminder[]>(queryKeys.reminders.all(userId), (old = []) =>
        old.map((r) => (r.id === reminderId ? { ...r, is_active: isActive } : r))
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.reminders.all(userId), context.previous)
      }
    },
    onSettled: () => invalidateAll(),
  })

  return {
    // Data
    reminders,
    upcomingReminders,
    remindersByType,
    activeReminders,
    upcomingCount,

    // State
    isLoading,
    error,

    // Actions
    createReminder: createReminderMutation.mutate,
    updateReminder: (
      reminderId: string,
      updates: Partial<Omit<Reminder, "id" | "user_id" | "created_at">>
    ) => updateReminderMutation.mutate({ reminderId, updates }),
    deleteReminder: deleteReminderMutation.mutate,
    toggleActive: (reminderId: string, isActive: boolean) =>
      toggleActiveMutation.mutate({ reminderId, isActive }),

    // Mutation states
    isCreating: createReminderMutation.isPending,
    isUpdating: updateReminderMutation.isPending,
    isDeleting: deleteReminderMutation.isPending,
  }
}

export default useRemindersHook
