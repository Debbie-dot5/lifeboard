import type { SupabaseClient } from "@supabase/supabase-js"
import type { Habit, HabitLog, CreateHabitInput } from "@lifeboard/types"
import { getTodayISO, calculateStreak } from "../utils"

// ─── DERIVED TYPES ───────────────────────────────────────────────────────────

export type HabitWithTodayStatus = Habit & {
  completed_today: boolean
  current_streak: number
  all_log_dates: string[]
}

// ─── FETCH ───────────────────────────────────────────────────────────────────

export const fetchHabits = async (
  supabase: SupabaseClient,
  userId: string
): Promise<Habit[]> => {
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export const fetchHabitLogs = async (
  supabase: SupabaseClient,
  habitId: string
): Promise<HabitLog[]> => {
  const { data, error } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("habit_id", habitId)
    .order("completed_on", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export const fetchTodayHabitStatus = async (
  supabase: SupabaseClient,
  userId: string
): Promise<HabitWithTodayStatus[]> => {
  const today = getTodayISO()

  // Step 1: Fetch all habits with today's log (left join)
  const { data: habits, error: hErr } = await supabase
    .from("habits")
    .select("*, habit_logs(id, completed_on)")
    .eq("user_id", userId)
    .eq("habit_logs.completed_on", today)
    .order("created_at", { ascending: true })

  if (hErr) throw new Error(hErr.message)
  if (!habits || habits.length === 0) return []

  // Step 2: Fetch all logs for these habits (for streaks + mini heatmap)
  const habitIds = habits.map((h: any) => h.id)
  const { data: logs, error: lErr } = await supabase
    .from("habit_logs")
    .select("habit_id, completed_on")
    .in("habit_id", habitIds)
    .order("completed_on", { ascending: false })

  if (lErr) throw new Error(lErr.message)

  // Step 3: Group logs by habit_id
  const logsByHabit = (logs ?? []).reduce(
    (acc, log) => {
      if (!acc[log.habit_id]) acc[log.habit_id] = []
      acc[log.habit_id].push(log.completed_on)
      return acc
    },
    {} as Record<string, string[]>
  )

  // Step 4: Map to HabitWithTodayStatus
  return habits.map((habit: any) => {
    const habitLogs = logsByHabit[habit.id] ?? []
    return {
      id: habit.id,
      user_id: habit.user_id,
      name: habit.name,
      frequency: habit.frequency,
      category: habit.category,
      scheduled_days: habit.scheduled_days ?? [],
      is_archived: habit.is_archived,
      created_at: habit.created_at,
      completed_today: (habit.habit_logs ?? []).length > 0,
      current_streak: calculateStreak(habitLogs, habit.scheduled_days ?? []),
      all_log_dates: habitLogs,
    }
  })
}

// ─── MUTATIONS ───────────────────────────────────────────────────────────────

export const logHabit = async (
  supabase: SupabaseClient,
  habitId: string,
  date: string
): Promise<HabitLog> => {
  const { data, error } = await supabase
    .from("habit_logs")
    .insert({ habit_id: habitId, completed_on: date })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const unlogHabit = async (
  supabase: SupabaseClient,
  habitId: string,
  date: string
): Promise<void> => {
  const { error } = await supabase
    .from("habit_logs")
    .delete()
    .eq("habit_id", habitId)
    .eq("completed_on", date)

  if (error) throw new Error(error.message)
}

export const createHabit = async (
  supabase: SupabaseClient,
  userId: string,
  input: CreateHabitInput
): Promise<Habit> => {
  const { data, error } = await supabase
    .from("habits")
    .insert({ ...input, user_id: userId, is_archived: false })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const updateHabit = async (
  supabase: SupabaseClient,
  habitId: string,
  updates: Partial<Omit<Habit, "id" | "user_id" | "created_at">>
): Promise<Habit> => {
  const { data, error } = await supabase
    .from("habits")
    .update(updates)
    .eq("id", habitId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const archiveHabit = async (
  supabase: SupabaseClient,
  habitId: string
): Promise<Habit> => {
  const { data, error } = await supabase
    .from("habits")
    .update({ is_archived: true })
    .eq("id", habitId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const deleteHabit = async (
  supabase: SupabaseClient,
  habitId: string
): Promise<void> => {
  const { error } = await supabase
    .from("habits")
    .delete()
    .eq("id", habitId)

  if (error) throw new Error(error.message)
}
