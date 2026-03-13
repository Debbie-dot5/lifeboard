import type { SupabaseClient } from "@supabase/supabase-js"
import type { Task, DayOfWeek } from "@lifeboard/types"

// ─── FETCH ────────────────────────────────────────────────────────────────────

export const fetchAllTasks = async (
  supabase: SupabaseClient,
  userId: string
): Promise<Task[]> => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export const fetchTasksByDay = async (
  supabase: SupabaseClient,
  userId: string,
  day: DayOfWeek
): Promise<Task[]> => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("day_of_week", day)
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── MUTATIONS ────────────────────────────────────────────────────────────────

export const createTask = async (
  supabase: SupabaseClient,
  userId: string,
  input: Omit<Task, "id" | "user_id" | "created_at" | "is_complete">
): Promise<Task> => {
  const { data, error } = await supabase
    .from("tasks")
    .insert({ ...input, user_id: userId, is_complete: false })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const toggleTaskComplete = async (
  supabase: SupabaseClient,
  taskId: string,
  isComplete: boolean
): Promise<Task> => {
  const { data, error } = await supabase
    .from("tasks")
    .update({ is_complete: isComplete })
    .eq("id", taskId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const deleteTask = async (
  supabase: SupabaseClient,
  taskId: string
): Promise<void> => {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)

  if (error) throw new Error(error.message)
}

export const updateTask = async (
  supabase: SupabaseClient,
  taskId: string,
  updates: Partial<Omit<Task, "id" | "user_id" | "created_at">>
): Promise<Task> => {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
