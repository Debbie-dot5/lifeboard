import type { SupabaseClient } from "@supabase/supabase-js"
import type { Reminder, CreateReminderInput } from "@lifeboard/types"

// ─── FETCH ────────────────────────────────────────────────────────────────────

export const fetchReminders = async (
  supabase: SupabaseClient,
  userId: string
): Promise<Reminder[]> => {
  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", userId)
    .order("trigger_at", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export const fetchUpcomingReminders = async (
  supabase: SupabaseClient,
  userId: string
): Promise<Reminder[]> => {
  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .gte("trigger_at", new Date().toISOString())
    .order("trigger_at", { ascending: true })
    .limit(10)

  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── MUTATIONS ────────────────────────────────────────────────────────────────

export const createReminder = async (
  supabase: SupabaseClient,
  userId: string,
  input: CreateReminderInput
): Promise<Reminder> => {
  const { data, error } = await supabase
    .from("reminders")
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const updateReminder = async (
  supabase: SupabaseClient,
  reminderId: string,
  updates: Partial<Omit<Reminder, "id" | "user_id" | "created_at">>
): Promise<Reminder> => {
  const { data, error } = await supabase
    .from("reminders")
    .update(updates)
    .eq("id", reminderId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const deleteReminder = async (
  supabase: SupabaseClient,
  reminderId: string
): Promise<void> => {
  const { error } = await supabase
    .from("reminders")
    .delete()
    .eq("id", reminderId)

  if (error) throw new Error(error.message)
}

export const toggleReminderActive = async (
  supabase: SupabaseClient,
  reminderId: string,
  isActive: boolean
): Promise<Reminder> => {
  const { data, error } = await supabase
    .from("reminders")
    .update({ is_active: isActive })
    .eq("id", reminderId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
