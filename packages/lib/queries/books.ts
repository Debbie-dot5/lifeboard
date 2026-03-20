import type { SupabaseClient } from "@supabase/supabase-js"
import type { Book, BookProgress, BookNote, ReadingGoal } from "@lifeboard/types"

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type BookWithProgress = Book & {
  progress: BookProgress | null
}

export type BookDetail = Book & {
  progress: BookProgress | null
  notes: BookNote[]
}

// ─── FETCH ───────────────────────────────────────────────────────────────────

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

export const fetchBooksWithProgress = async (
  supabase: SupabaseClient,
  userId: string
): Promise<BookWithProgress[]> => {
  const [booksResult, progressResult] = await Promise.all([
    supabase
      .from("books")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("book_progress")
      .select("*")
      .eq("user_id", userId),
  ])

  if (booksResult.error) throw new Error(booksResult.error.message)
  if (progressResult.error) throw new Error(progressResult.error.message)

  const progressMap = new Map<string, BookProgress>()
  for (const p of progressResult.data ?? []) {
    progressMap.set(p.book_id, p)
  }

  return (booksResult.data ?? []).map((book) => ({
    ...book,
    progress: progressMap.get(book.id) ?? null,
  }))
}

export const fetchBook = async (
  supabase: SupabaseClient,
  userId: string,
  bookId: string
): Promise<BookDetail> => {
  const [bookResult, progressResult, notesResult] = await Promise.all([
    supabase.from("books").select("*").eq("id", bookId).single(),
    supabase
      .from("book_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .maybeSingle(),
    supabase
      .from("book_notes")
      .select("*")
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .order("page_number", { ascending: true }),
  ])

  if (bookResult.error) throw new Error(bookResult.error.message)
  // PGRST116 = no rows found — that's fine for progress
  if (progressResult.error && progressResult.error.code !== "PGRST116")
    throw new Error(progressResult.error.message)
  if (notesResult.error) throw new Error(notesResult.error.message)

  return {
    ...bookResult.data,
    progress: progressResult.data ?? null,
    notes: notesResult.data ?? [],
  }
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
    .maybeSingle() 

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

export const fetchBookNotes = async (
  supabase: SupabaseClient,
  userId: string,
  bookId: string
): Promise<BookNote[]> => {
  const { data, error } = await supabase
    .from("book_notes")
    .select("*")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .order("page_number", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export const fetchReadingDates = async (
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> => {
  const { data, error } = await supabase
    .from("book_progress")
    .select("last_read_at")
    .eq("user_id", userId)

  if (error) throw new Error(error.message)
  if (!data) return []

  // Extract distinct ISO date strings (YYYY-MM-DD)
  const dateSet = new Set<string>()
  for (const row of data) {
    if (row.last_read_at) {
      dateSet.add(row.last_read_at.split("T")[0])
    }
  }
  return Array.from(dateSet).sort()
}

// ─── MUTATIONS ───────────────────────────────────────────────────────────────

export const createBook = async (
  supabase: SupabaseClient,
  userId: string,
  input: Omit<Book, "id" | "user_id" | "created_at">
): Promise<Book> => {
  const { data, error } = await supabase
    .from("books")
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

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
  userId: string,
  bookId: string,
  fileUrl: string,
  coverUrl: string | null
): Promise<void> => {
  // Delete files from storage first
  if (fileUrl) {
    await supabase.storage.from("books").remove([fileUrl])
  }
  if (coverUrl) {
    // Extract path from public URL if it's a full URL
    const coverPath = coverUrl.includes("/book-covers/")
      ? coverUrl.split("/book-covers/")[1]
      : coverUrl
    await supabase.storage.from("book-covers").remove([coverPath])
  }

  const { error } = await supabase
    .from("books")
    .delete()
    .eq("id", bookId)

  if (error) throw new Error(error.message)
}

export const createBookNote = async (
  supabase: SupabaseClient,
  userId: string,
  input: { book_id: string; page_number: number; note_text: string; highlight_text?: string | null }
): Promise<BookNote> => {
  const { data, error } = await supabase
    .from("book_notes")
    .insert({
      ...input,
      user_id: userId,
      highlight_text: input.highlight_text ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const deleteBookNote = async (
  supabase: SupabaseClient,
  noteId: string
): Promise<void> => {
  const { error } = await supabase
    .from("book_notes")
    .delete()
    .eq("id", noteId)

  if (error) throw new Error(error.message)
}

export const createReadingGoal = async (
  supabase: SupabaseClient,
  userId: string,
  input: { year: number; month?: number | null; target_count: number }
): Promise<ReadingGoal> => {
  const { data, error } = await supabase
    .from("reading_goals")
    .insert({
      user_id: userId,
      year: input.year,
      month: input.month ?? null,
      target_count: input.target_count,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const updateReadingGoal = async (
  supabase: SupabaseClient,
  goalId: string,
  targetCount: number
): Promise<ReadingGoal> => {
  const { data, error } = await supabase
    .from("reading_goals")
    .update({ target_count: targetCount })
    .eq("id", goalId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
