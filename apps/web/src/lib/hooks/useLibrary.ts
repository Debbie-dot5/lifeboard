"use client"

import { useRef, useCallback, useMemo, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import {
  queryKeys,
  fetchBooksWithProgress,
  fetchReadingGoals,
  fetchReadingDates,
  fetchBook,
  fetchBookNotes,
  createBook,
  deleteBook,
  updateBookProgress,
  createBookNote,
  deleteBookNote,
  createReadingGoal,
  updateReadingGoal,
  calculateStreak,
} from "@lifeboard/lib"
import type { BookWithProgress, BookDetail } from "@lifeboard/lib"
import type { Book, BookProgress, BookNote, ReadingGoal } from "@lifeboard/types"
import { extractCoverAndMetadata } from "@/lib/utils/extract-cover"

// ─── MAIN HOOK ───────────────────────────────────────────────────────────────

const useLibrary = (userId: string) => {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingProgressRef = useRef<{ bookId: string; page: number } | null>(null)

  // ── QUERIES ──────────────────────────────────────────────────────────────

  const {
    data: books = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.books.all(userId),
    queryFn: () => fetchBooksWithProgress(supabase, userId),
    enabled: !!userId,
  })

  const { data: readingGoals = [] } = useQuery({
    queryKey: queryKeys.books.goals(userId),
    queryFn: () => fetchReadingGoals(supabase, userId),
    enabled: !!userId,
  })

  const { data: readingDates = [] } = useQuery({
    queryKey: queryKeys.books.readingDates(userId),
    queryFn: () => fetchReadingDates(supabase, userId),
    enabled: !!userId,
  })

  // ── UPLOAD BOOK MUTATION ─────────────────────────────────────────────────

  const uploadBookMutation = useMutation({
    mutationFn: async (input: { file: File; title: string; author?: string }) => {
      const { file, title, author } = input
      const fileType = file.name.endsWith(".epub") ? "epub" : "pdf" as const

      // 1. Upload file to storage
      const storagePath = `${userId}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from("books")
        .upload(storagePath, file, { contentType: file.type })

      if (uploadError) throw new Error(uploadError.message)

      // 2. Extract cover + page count
      const { coverUrl, pageCount } = await extractCoverAndMetadata(
        file, fileType, supabase, userId
      )

      // 3. Create DB record
      return createBook(supabase, userId, {
        title,
        author: author || null,
        file_url: storagePath,
        cover_url: coverUrl,
        file_type: fileType,
        total_pages: pageCount,
      })
    },

    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.books.all(userId) })
      const previous = queryClient.getQueryData<BookWithProgress[]>(queryKeys.books.all(userId))

      const fileType = input.file.name.endsWith(".epub") ? "epub" : "pdf" as const
      queryClient.setQueryData<BookWithProgress[]>(queryKeys.books.all(userId), (old = []) => [
        {
          id: `temp-${Date.now()}`,
          user_id: userId,
          title: input.title,
          author: input.author || null,
          file_url: "",
          cover_url: null,
          file_type: fileType,
          total_pages: null,
          created_at: new Date().toISOString(),
          progress: null,
        },
        ...old,
      ])

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.books.all(userId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books.all(userId) })
    },
  })

  // ── DELETE BOOK MUTATION ─────────────────────────────────────────────────

  const deleteBookMutation = useMutation({
    mutationFn: (book: { id: string; file_url: string; cover_url: string | null }) =>
      deleteBook(supabase, userId, book.id, book.file_url, book.cover_url),

    onMutate: async (book) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.books.all(userId) })
      const previous = queryClient.getQueryData<BookWithProgress[]>(queryKeys.books.all(userId))

      queryClient.setQueryData<BookWithProgress[]>(queryKeys.books.all(userId), (old = []) =>
        old.filter((b) => b.id !== book.id)
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.books.all(userId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books.all(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary(userId) })
    },
  })

  // ── UPDATE PROGRESS MUTATION ─────────────────────────────────────────────

  const updateProgressMutation = useMutation({
    mutationFn: ({ bookId, page }: { bookId: string; page: number }) =>
      updateBookProgress(supabase, userId, bookId, page),

    onSettled: (_data, _err, { bookId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books.progress(userId, bookId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.books.all(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.books.readingDates(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary(userId) })
    },
  })

  // Debounced wrapper — optimistic update is instant, API call is debounced 5s
  const debouncedUpdateProgress = useCallback(
    (bookId: string, page: number) => {
      // Optimistic cache update immediately
      queryClient.setQueryData(
        queryKeys.books.progress(userId, bookId),
        (old: BookProgress | null | undefined) => ({
          ...(old ?? { id: `temp-${Date.now()}`, book_id: bookId, user_id: userId }),
          current_page: page,
          last_read_at: new Date().toISOString(),
        })
      )

      // Also update in the books list
      queryClient.setQueryData<BookWithProgress[]>(
        queryKeys.books.all(userId),
        (old = []) =>
          old.map((b) =>
            b.id === bookId
              ? {
                  ...b,
                  progress: {
                    ...(b.progress ?? { id: `temp-${Date.now()}`, book_id: bookId, user_id: userId }),
                    current_page: page,
                    last_read_at: new Date().toISOString(),
                  } as BookProgress,
                }
              : b
          )
      )

      pendingProgressRef.current = { bookId, page }

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = setTimeout(() => {
        updateProgressMutation.mutate({ bookId, page })
        pendingProgressRef.current = null
      }, 5000)
    },
    [userId, queryClient, updateProgressMutation]
  )

  // Flush pending progress on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (pendingProgressRef.current) {
        const { bookId, page } = pendingProgressRef.current
        updateBookProgress(supabase, userId, bookId, page)
      }
    }
  }, [userId, supabase])

  // ── NOTE MUTATIONS ───────────────────────────────────────────────────────

  const createNoteMutation = useMutation({
    mutationFn: (input: { book_id: string; page_number: number; note_text: string; highlight_text?: string | null }) =>
      createBookNote(supabase, userId, input),

    onMutate: async (newNote) => {
      const key = queryKeys.books.notes(userId, newNote.book_id)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<BookNote[]>(key)

      queryClient.setQueryData<BookNote[]>(key, (old = []) => [
        ...old,
        {
          id: `temp-${Date.now()}`,
          book_id: newNote.book_id,
          user_id: userId,
          page_number: newNote.page_number,
          note_text: newNote.note_text,
          highlight_text: newNote.highlight_text ?? null,
          created_at: new Date().toISOString(),
        },
      ])

      return { previous }
    },
    onError: (_err, vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.books.notes(userId, vars.book_id), context.previous)
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books.notes(userId, vars.book_id) })
    },
  })

  const deleteNoteMutation = useMutation({
    mutationFn: ({ noteId, bookId }: { noteId: string; bookId: string }) =>
      deleteBookNote(supabase, noteId),

    onMutate: async ({ noteId, bookId }) => {
      const key = queryKeys.books.notes(userId, bookId)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<BookNote[]>(key)

      queryClient.setQueryData<BookNote[]>(key, (old = []) =>
        old.filter((n) => n.id !== noteId)
      )

      return { previous }
    },
    onError: (_err, { bookId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.books.notes(userId, bookId), context.previous)
      }
    },
    onSettled: (_data, _err, { bookId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books.notes(userId, bookId) })
    },
  })

  // ── GOAL MUTATIONS ───────────────────────────────────────────────────────

  const createGoalMutation = useMutation({
    mutationFn: (input: { year: number; month?: number | null; target_count: number }) =>
      createReadingGoal(supabase, userId, input),

    onMutate: async (newGoal) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.books.goals(userId) })
      const previous = queryClient.getQueryData<ReadingGoal[]>(queryKeys.books.goals(userId))

      queryClient.setQueryData<ReadingGoal[]>(queryKeys.books.goals(userId), (old = []) => [
        ...old,
        {
          id: `temp-${Date.now()}`,
          user_id: userId,
          year: newGoal.year,
          month: newGoal.month ?? null,
          target_count: newGoal.target_count,
          created_at: new Date().toISOString(),
        },
      ])

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.books.goals(userId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books.goals(userId) })
    },
  })

  const updateGoalMutation = useMutation({
    mutationFn: ({ goalId, targetCount }: { goalId: string; targetCount: number }) =>
      updateReadingGoal(supabase, goalId, targetCount),

    onMutate: async ({ goalId, targetCount }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.books.goals(userId) })
      const previous = queryClient.getQueryData<ReadingGoal[]>(queryKeys.books.goals(userId))

      queryClient.setQueryData<ReadingGoal[]>(queryKeys.books.goals(userId), (old = []) =>
        old.map((g) => (g.id === goalId ? { ...g, target_count: targetCount } : g))
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.books.goals(userId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books.goals(userId) })
    },
  })

  // ── COMPUTED ─────────────────────────────────────────────────────────────

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const yearlyGoal = readingGoals.find((g) => g.year === currentYear && !g.month) ?? null
  const monthlyGoal = readingGoals.find((g) => g.year === currentYear && g.month === currentMonth) ?? null

  const currentlyReading = useMemo(
    () =>
      books
        .filter((b) => {
          if (!b.progress || b.progress.current_page === 0) return false
          if (b.total_pages && b.progress.current_page >= b.total_pages) return false
          // Only books opened in last 7 days
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
          return new Date(b.progress.last_read_at).getTime() > sevenDaysAgo
        })
        .sort(
          (a, b) =>
            new Date(b.progress!.last_read_at).getTime() -
            new Date(a.progress!.last_read_at).getTime()
        ),
    [books]
  )

  const booksFinishedThisYear = useMemo(
    () =>
      books.filter(
        (b) =>
          b.progress &&
          b.total_pages &&
          b.progress.current_page >= b.total_pages &&
          new Date(b.progress.last_read_at).getFullYear() === currentYear
      ),
    [books, currentYear]
  )

  const readingGoalProgress = yearlyGoal
    ? { target: yearlyGoal.target_count, current: booksFinishedThisYear.length }
    : null

  const monthlyGoalProgress = useMemo(() => {
    if (!monthlyGoal) return null
    const finishedThisMonth = books.filter((b) => {
      if (!b.progress || !b.total_pages) return false
      if (b.progress.current_page < b.total_pages) return false
      const d = new Date(b.progress.last_read_at)
      return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth
    })
    return { target: monthlyGoal.target_count, current: finishedThisMonth.length }
  }, [books, monthlyGoal, currentYear, currentMonth])

  const readingStreak = useMemo(
    () => calculateStreak(readingDates),
    [readingDates]
  )

  // ── RETURN ───────────────────────────────────────────────────────────────

  return {
    // Data
    books,
    readingGoals,
    currentlyReading,
    booksFinishedThisYear,
    readingGoalProgress,
    monthlyGoalProgress,
    readingStreak,
    yearlyGoal,
    monthlyGoal,

    // State
    isLoading,
    error,

    // Actions
    uploadBook: (input: { file: File; title: string; author?: string }) =>
      uploadBookMutation.mutateAsync(input),
    deleteBook: (book: { id: string; file_url: string; cover_url: string | null }) =>
      deleteBookMutation.mutate(book),
    updateProgress: debouncedUpdateProgress,
    createNote: (input: { book_id: string; page_number: number; note_text: string; highlight_text?: string | null }) =>
      createNoteMutation.mutateAsync(input),
    deleteNote: (noteId: string, bookId: string) =>
      deleteNoteMutation.mutate({ noteId, bookId }),
    createReadingGoal: (input: { year: number; month?: number | null; target_count: number }) =>
      createGoalMutation.mutate(input),
    updateReadingGoal: (goalId: string, targetCount: number) =>
      updateGoalMutation.mutate({ goalId, targetCount }),

    // Mutation states
    isUploading: uploadBookMutation.isPending,
    isDeleting: deleteBookMutation.isPending,
    isCreatingNote: createNoteMutation.isPending,
    isCreatingGoal: createGoalMutation.isPending,
  }
}

// ─── SINGLE BOOK READER HOOK ─────────────────────────────────────────────────

export const useBookReader = (userId: string, bookId: string) => {
  const supabase = createClient()

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.books.book(userId, bookId),
    queryFn: () => fetchBook(supabase, userId, bookId),
    enabled: !!userId && !!bookId,
  })

  const { data: notes = [] } = useQuery({
    queryKey: queryKeys.books.notes(userId, bookId),
    queryFn: () => fetchBookNotes(supabase, userId, bookId),
    enabled: !!userId && !!bookId,
  })

  return {
    book: data ?? null,
    notes,
    isLoading,
    error,
  }
}

export default useLibrary
