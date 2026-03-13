"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import {
  queryKeys,
  fetchAllTasks,
  createTask,
  toggleTaskComplete,
  deleteTask,
  updateTask,
} from "@lifeboard/lib"
import type { Task, DayOfWeek } from "@lifeboard/types"

const useTasksHook = (userId: string) => {
  const supabase = createClient()
  const queryClient = useQueryClient()

  // ── QUERY ──────────────────────────────────────────────────────────────────
  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.tasks.all(userId),
    queryFn: () => fetchAllTasks(supabase, userId),
    enabled: !!userId,
  })

  // Tasks grouped by day — derived from the cache, no extra fetch
  const tasksByDay = tasks.reduce((acc, task) => {
    if (!acc[task.day_of_week]) acc[task.day_of_week] = []
    acc[task.day_of_week].push(task)
    return acc
  }, {} as Record<DayOfWeek, Task[]>)

  // ── MUTATIONS ──────────────────────────────────────────────────────────────

  const createTaskMutation = useMutation({
    mutationFn: (input: Omit<Task, "id" | "user_id" | "created_at" | "is_complete">) =>
      createTask(supabase, userId, input),

    // Optimistic update — UI responds instantly
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all(userId) })
      const previous = queryClient.getQueryData<Task[]>(queryKeys.tasks.all(userId))

      queryClient.setQueryData<Task[]>(queryKeys.tasks.all(userId), (old = []) => [
        ...old,
        {
          ...newTask,
          id: `temp-${Date.now()}`,
          user_id: userId,
          is_complete: false,
          created_at: new Date().toISOString(),
        },
      ])

      return { previous }
    },
    onError: (_err, _vars, context) => {
      // Roll back on failure
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tasks.all(userId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(userId) })
    },
  })

  const toggleTaskMutation = useMutation({
    mutationFn: ({ taskId, isComplete }: { taskId: string; isComplete: boolean }) =>
      toggleTaskComplete(supabase, taskId, isComplete),

    // Optimistic — checkbox feels instant
    onMutate: async ({ taskId, isComplete }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all(userId) })
      const previous = queryClient.getQueryData<Task[]>(queryKeys.tasks.all(userId))

      queryClient.setQueryData<Task[]>(queryKeys.tasks.all(userId), (old = []) =>
        old.map((t) => (t.id === taskId ? { ...t, is_complete: isComplete } : t))
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tasks.all(userId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(userId) })
      // Also invalidate dashboard since it shows task stats
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary(userId) })
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(supabase, taskId),

    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all(userId) })
      const previous = queryClient.getQueryData<Task[]>(queryKeys.tasks.all(userId))

      queryClient.setQueryData<Task[]>(queryKeys.tasks.all(userId), (old = []) =>
        old.filter((t) => t.id !== taskId)
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tasks.all(userId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(userId) })
    },
  })

  // ── COMPUTED ───────────────────────────────────────────────────────────────
  const weeklyStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.is_complete).length,
  }

  return {
    // Data
    tasks,
    tasksByDay,
    weeklyStats,

    // State
    isLoading,
    error,

    // Actions
    createTask: createTaskMutation.mutate,
    toggleComplete: (taskId: string, isComplete: boolean) =>
      toggleTaskMutation.mutate({ taskId, isComplete }),
    deleteTask: deleteTaskMutation.mutate,

    // Mutation states (for loading spinners, disabled buttons etc.)
    isCreating: createTaskMutation.isPending,
    isToggling: toggleTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  }
}

export default useTasksHook
