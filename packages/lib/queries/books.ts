import type { SupabaseClient } from "@supabase/supabase-js"
import type { Book, BookProgress, BookNote, ReadingGoal } from "@lifeboard/types"

// ─── FETCH ────────────────────────────────────────────────────────────────────

export const fetchBooks = async (
  supabase: SupabaseClient,
  userId: string
): Promise<Book[]> => {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export const fetchBookProgress = async (
  supabase: SupabaseClient,
  userId: string,
  bookId: string
): Promise<BookProgress | null> => {
  const { data, error } = await supabase
    .from("book_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .single()

  if (error && error.code !== "PGRST116") throw new Error(error.message)
  return data ?? null
}

export const fetchReadingGoals = async (
  supabase: SupabaseClient,
  userId: string
): Promise<ReadingGoal[]> => {
  const { data, error } = await supabase
    .from("reading_goals")
    .select("*")
    .eq("user_id", userId)

  if (error) throw new Error(error.message)
  return data ?? []
}

// ─── MUTATIONS ────────────────────────────────────────────────────────────────

export const updateBookProgress = async (
  supabase: SupabaseClient,
  userId: string,
  bookId: string,
  currentPage: number
): Promise<BookProgress> => {
  const { data, error } = await supabase
    .from("book_progress")
    .upsert({
      user_id: userId,
      book_id: bookId,
      current_page: currentPage,
      last_read_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const deleteBook = async (
  supabase: SupabaseClient,
  bookId: string
): Promise<void> => {
  const { error } = await supabase
    .from("books")
    .delete()
    .eq("id", bookId)

  if (error) throw new Error(error.message)
}
