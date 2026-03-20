"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import {
  queryKeys,
  fetchBooks,
  fetchBookProgress,
  updateBookProgress,
  fetchReadingGoals,
  deleteBook,
} from "@lifeboard/lib"
import type { Book } from "@lifeboard/types"

const useBooksHook = (userId: string) => {
  const supabase = createClient()
  const queryClient = useQueryClient()

  // ── ALL BOOKS ──────────────────────────────────────────────────────────────
  const {
    data: books = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.books.all(userId),
    queryFn: () => fetchBooks(supabase, userId),
    enabled: !!userId,
  })

  // ── READING GOALS ──────────────────────────────────────────────────────────
  const { data: readingGoals = [] } = useQuery({
    queryKey: queryKeys.books.goals(userId),
    queryFn: () => fetchReadingGoals(supabase, userId),
    enabled: !!userId,
  })

  // ── UPDATE PROGRESS ────────────────────────────────────────────────────────
  const updateProgressMutation = useMutation({
    mutationFn: ({ bookId, page }: { bookId: string; page: number }) =>
      updateBookProgress(supabase, userId, bookId, page),

    // Optimistic — page number updates instantly in reader
    onMutate: async ({ bookId, page }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.books.progress(userId, bookId) })
      const previous = queryClient.getQueryData(queryKeys.books.progress(userId, bookId))

      queryClient.setQueryData(queryKeys.books.progress(userId, bookId), (old: any) => ({
        ...old,
        current_page: page,
        last_read_at: new Date().toISOString(),
      }))

      return { previous }
    },
    onError: (_err, { bookId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.books.progress(userId, bookId), context.previous)
      }
    },
    onSettled: (_data, _err, { bookId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books.progress(userId, bookId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary(userId) })
    },
  })

  // ── DELETE BOOK ────────────────────────────────────────────────────────────
  const deleteBookMutation = useMutation({
    mutationFn: ({ bookId, fileUrl, coverUrl }: { bookId: string; fileUrl: string; coverUrl: string | null }) =>
      deleteBook(supabase, userId, bookId, fileUrl, coverUrl),

    onMutate: async ({ bookId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.books.all(userId) })
      const previous = queryClient.getQueryData<Book[]>(queryKeys.books.all(userId))

      queryClient.setQueryData<Book[]>(queryKeys.books.all(userId), (old = []) =>
        old.filter((b) => b.id !== bookId)
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
    },
  })

  // ── COMPUTED ───────────────────────────────────────────────────────────────
  const currentYear = new Date().getFullYear()
  const yearlyGoal = readingGoals.find((g) => g.year === currentYear && !g.month)
  const booksFinished = books.filter((b) => b.total_pages).length // rough count

  return {
    books,
    readingGoals,
    yearlyGoal,
    booksFinished,
    isLoading,
    error,

    updateProgress: (bookId: string, page: number) =>
      updateProgressMutation.mutate({ bookId, page }),
    deleteBook: deleteBookMutation.mutate,

    isUpdatingProgress: updateProgressMutation.isPending,
    isDeleting: deleteBookMutation.isPending,
  }
}

// Hook for a single book's progress — used inside the reader
export const useBookProgress = (userId: string, bookId: string) => {
  const supabase = createClient()

  return useQuery({
    queryKey: queryKeys.books.progress(userId, bookId),
    queryFn: () => fetchBookProgress(supabase, userId, bookId),
    enabled: !!userId && !!bookId,
    // Refetch more frequently in reader — user is actively reading
    staleTime: 10 * 1000,
  })
}

export default useBooksHook
