"use client"

import { useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import {
  queryKeys,
  fetchAllTasks,
  fetchUpcomingReminders,
  fetchPlans,
  fetchTodayHabitStatus,
  fetchBooksWithProgress,
  fetchJournalEntries,
  fetchReadingDates,
  fetchReadingGoals,
  createTask as createTaskFn,
  toggleTaskComplete,
  logHabit as logHabitFn,
  unlogHabit as unlogHabitFn,
  getTodayDayOfWeek,
  getTodayISO,
  calculateStreak,
} from "@lifeboard/lib"
import type { HabitWithTodayStatus, PlanWithProgress, BookWithProgress } from "@lifeboard/lib"
import type { Task, Reminder, JournalEntry, ReadingGoal, DayOfWeek } from "@lifeboard/types"

const DAYS_ORDER: DayOfWeek[] = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
]

const useDashboard = (userId: string) => {
  const supabase = createClient()
  const queryClient = useQueryClient()

  // ── QUERIES ──────────────────────────────────────────────────────────────

  const {
    data: tasks = [],
    isLoading: tasksLoading,
  } = useQuery({
    queryKey: queryKeys.tasks.all(userId),
    queryFn: () => fetchAllTasks(supabase, userId),
    enabled: !!userId,
  })

  const {
    data: reminders = [],
    isLoading: remindersLoading,
  } = useQuery({
    queryKey: queryKeys.reminders.upcoming(userId),
    queryFn: () => fetchUpcomingReminders(supabase, userId),
    enabled: !!userId,
  })

  const {
    data: plans = [],
    isLoading: plansLoading,
  } = useQuery({
    queryKey: queryKeys.plans.all(userId),
    queryFn: () => fetchPlans(supabase, userId),
    enabled: !!userId,
  })

  const {
    data: habits = [],
    isLoading: habitsLoading,
  } = useQuery({
    queryKey: queryKeys.habits.todayStatus(userId),
    queryFn: () => fetchTodayHabitStatus(supabase, userId),
    enabled: !!userId,
  })

  const {
    data: books = [],
    isLoading: booksLoading,
  } = useQuery({
    queryKey: queryKeys.books.all(userId),
    queryFn: () => fetchBooksWithProgress(supabase, userId),
    enabled: !!userId,
  })

  const {
    data: journalEntries = [],
    isLoading: journalLoading,
  } = useQuery({
    queryKey: queryKeys.journal.all(userId),
    queryFn: () => fetchJournalEntries(supabase, userId),
    enabled: !!userId,
  })

  const {
    data: readingDates = [],
    isLoading: readingDatesLoading,
  } = useQuery({
    queryKey: queryKeys.books.readingDates(userId),
    queryFn: () => fetchReadingDates(supabase, userId),
    enabled: !!userId,
  })

  const {
    data: readingGoals = [],
    isLoading: goalsLoading,
  } = useQuery({
    queryKey: queryKeys.books.goals(userId),
    queryFn: () => fetchReadingGoals(supabase, userId),
    enabled: !!userId,
  })

  // ── MUTATIONS ────────────────────────────────────────────────────────────

  const toggleTaskMutation = useMutation({
    mutationFn: ({ taskId, isComplete }: { taskId: string; isComplete: boolean }) =>
      toggleTaskComplete(supabase, taskId, isComplete),

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
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary(userId) })
    },
  })

  const createTaskMutation = useMutation({
    mutationFn: (input: Omit<Task, "id" | "user_id" | "created_at" | "is_complete">) =>
      createTaskFn(supabase, userId, input),

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
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tasks.all(userId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(userId) })
    },
  })

  const logHabitMutation = useMutation({
    mutationFn: ({ habitId, date }: { habitId: string; date: string }) =>
      logHabitFn(supabase, habitId, date),

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
                  completed_today: true,
                  current_streak: h.current_streak + 1,
                  all_log_dates: [date, ...h.all_log_dates],
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

  const unlogHabitMutation = useMutation({
    mutationFn: ({ habitId, date }: { habitId: string; date: string }) =>
      unlogHabitFn(supabase, habitId, date),

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

  // ── DERIVED DATA ─────────────────────────────────────────────────────────

  const today = getTodayDayOfWeek()
  const todayISO = getTodayISO()

  const todaysTasks = useMemo(
    () => tasks.filter((t) => t.day_of_week === today),
    [tasks, today]
  )

  const weeklyStats = useMemo(
    () => ({
      total: tasks.length,
      completed: tasks.filter((t) => t.is_complete).length,
    }),
    [tasks]
  )

  const tasksByDay = useMemo(() => {
    const grouped: Record<string, { total: number; completed: number }> = {}
    for (const day of DAYS_ORDER) {
      const dayTasks = tasks.filter((t) => t.day_of_week === day)
      grouped[day] = {
        total: dayTasks.length,
        completed: dayTasks.filter((t) => t.is_complete).length,
      }
    }
    return grouped
  }, [tasks])

  const habitsToday = useMemo(
    () => habits.filter((h) => !h.is_archived),
    [habits]
  )

  const habitProgress = useMemo(
    () => ({
      total: habitsToday.length,
      completed: habitsToday.filter((h) => h.completed_today).length,
    }),
    [habitsToday]
  )

  const longestHabitStreak = useMemo(
    () => (habitsToday.length > 0 ? Math.max(...habitsToday.map((h) => h.current_streak)) : 0),
    [habitsToday]
  )

  const allHabitsCompletedToday = useMemo(
    () => habitsToday.length > 0 && habitsToday.every((h) => h.completed_today),
    [habitsToday]
  )

  const activePlans = useMemo(() => {
    const sorted = [...plans].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
      return b.progress_percent - a.progress_percent
    })
    return sorted.slice(0, 3)
  }, [plans])

  const currentlyReading = useMemo(() => {
    return (
      books
        .filter((b) => {
          if (!b.progress || b.progress.current_page === 0) return false
          if (b.total_pages && b.progress.current_page >= b.total_pages) return false
          return true
        })
        .sort(
          (a, b) =>
            new Date(b.progress!.last_read_at).getTime() -
            new Date(a.progress!.last_read_at).getTime()
        )[0] ?? null
    )
  }, [books])

  const readingStreak = useMemo(
    () => calculateStreak(readingDates),
    [readingDates]
  )

  const booksReadThisYear = useMemo(() => {
    const year = new Date().getFullYear()
    return books.filter((b) => {
      if (!b.progress || !b.total_pages) return false
      if (b.progress.current_page < b.total_pages) return false
      const readYear = new Date(b.progress.last_read_at).getFullYear()
      return readYear === year
    }).length
  }, [books])

  const yearlyReadingGoal = useMemo(() => {
    const year = new Date().getFullYear()
    return readingGoals.find((g) => g.year === year && g.month === null) ?? null
  }, [readingGoals])

  const lastJournalEntry = useMemo(
    () => journalEntries[0] ?? null,
    [journalEntries]
  )

  const journalEntriesThisMonth = useMemo(() => {
    const now = new Date()
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    return journalEntries.filter((e) => e.created_at.startsWith(monthStr)).length
  }, [journalEntries])

  const journalEntriesThisWeek = useMemo(() => {
    const now = new Date()
    const startOfWeek = new Date(now)
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    startOfWeek.setDate(now.getDate() - diff)
    startOfWeek.setHours(0, 0, 0, 0)

    return journalEntries.filter(
      (e) => new Date(e.created_at) >= startOfWeek
    )
  }, [journalEntries])

  // ── LOADING ──────────────────────────────────────────────────────────────

  const isLoading =
    tasksLoading ||
    remindersLoading ||
    plansLoading ||
    habitsLoading ||
    booksLoading ||
    journalLoading ||
    readingDatesLoading ||
    goalsLoading

  return {
    // Data
    todaysTasks,
    weeklyStats,
    tasksByDay,
    upcomingReminders: reminders,
    activePlans,
    habitsToday,
    habitProgress,
    longestHabitStreak,
    allHabitsCompletedToday,
    currentlyReading,
    readingStreak,
    booksReadThisYear,
    yearlyReadingGoal,
    lastJournalEntry,
    journalEntriesThisMonth,
    journalEntriesThisWeek,

    // Actions
    toggleTask: (taskId: string, isComplete: boolean) =>
      toggleTaskMutation.mutate({ taskId, isComplete }),
    createTask: createTaskMutation.mutate,
    logHabit: (habitId: string) =>
      logHabitMutation.mutate({ habitId, date: todayISO }),
    unlogHabit: (habitId: string) =>
      unlogHabitMutation.mutate({ habitId, date: todayISO }),

    // State
    isLoading,
    isCreatingTask: createTaskMutation.isPending,
  }
}

export default useDashboard
