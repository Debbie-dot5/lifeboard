import type { SupabaseClient } from "@supabase/supabase-js"
import type { JournalEntry, CreateJournalEntryInput } from "@lifeboard/types"

// ─── FETCH ────────────────────────────────────────────────────────────────────

export const fetchJournalEntries = async (
  supabase: SupabaseClient,
  userId: string
): Promise<JournalEntry[]> => {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export const fetchJournalEntry = async (
  supabase: SupabaseClient,
  entryId: string
): Promise<JournalEntry> => {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", entryId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ─── MUTATIONS ────────────────────────────────────────────────────────────────

export const createJournalEntry = async (
  supabase: SupabaseClient,
  userId: string,
  input: CreateJournalEntryInput
): Promise<JournalEntry> => {
  const { data, error } = await supabase
    .from("journal_entries")
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const updateJournalEntry = async (
  supabase: SupabaseClient,
  entryId: string,
  updates: Partial<Omit<JournalEntry, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<JournalEntry> => {
  const { data, error } = await supabase
    .from("journal_entries")
    .update(updates)
    .eq("id", entryId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const deleteJournalEntry = async (
  supabase: SupabaseClient,
  entryId: string
): Promise<void> => {
  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", entryId)

  if (error) throw new Error(error.message)
}

// ─── MEDIA ────────────────────────────────────────────────────────────────────

export const uploadJournalMedia = async (
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<string> => {
  const path = `${userId}/${Date.now()}-${file.name}`

  const { error } = await supabase.storage
    .from("journal-media")
    .upload(path, file)

  if (error) throw new Error(error.message)

  const { data } = supabase.storage
    .from("journal-media")
    .getPublicUrl(path)

  return data.publicUrl
}
