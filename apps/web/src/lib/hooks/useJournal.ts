"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import {
  queryKeys,
  fetchJournalEntries,
  fetchJournalEntry,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  uploadJournalMedia,
} from "@lifeboard/lib"
import type { JournalEntry, CreateJournalEntryInput } from "@lifeboard/types"

const useJournal = (userId: string) => {
  const supabase = createClient()
  const queryClient = useQueryClient()

  // ── QUERY ──────────────────────────────────────────────────────────────────
  const {
    data: entries = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.journal.all(userId),
    queryFn: () => fetchJournalEntries(supabase, userId),
    enabled: !!userId,
  })

  // ── MUTATIONS ──────────────────────────────────────────────────────────────

  const createEntryMutation = useMutation({
    mutationFn: (input: CreateJournalEntryInput) =>
      createJournalEntry(supabase, userId, input),

    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.journal.all(userId) })
      const previous = queryClient.getQueryData<JournalEntry[]>(queryKeys.journal.all(userId))

      queryClient.setQueryData<JournalEntry[]>(queryKeys.journal.all(userId), (old = []) => [
        {
          ...newEntry,
          id: `temp-${Date.now()}`,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...old,
      ])

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.journal.all(userId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.all(userId) })
    },
  })

  const updateEntryMutation = useMutation({
    mutationFn: ({
      entryId,
      updates,
    }: {
      entryId: string
      updates: Partial<Omit<JournalEntry, "id" | "user_id" | "created_at" | "updated_at">>
    }) => updateJournalEntry(supabase, entryId, updates),

    onMutate: async ({ entryId, updates }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.journal.all(userId) })
      const previous = queryClient.getQueryData<JournalEntry[]>(queryKeys.journal.all(userId))

      queryClient.setQueryData<JournalEntry[]>(queryKeys.journal.all(userId), (old = []) =>
        old.map((e) => (e.id === entryId ? { ...e, ...updates, updated_at: new Date().toISOString() } : e))
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.journal.all(userId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.all(userId) })
    },
  })

  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      // Clean up storage files before deleting the record
      const entry = await fetchJournalEntry(supabase, entryId)
      if (entry.media_urls?.length) {
        const paths = entry.media_urls
          .map((url) => url.split("/journal-media/")[1])
          .filter(Boolean)
        if (paths.length) {
          await supabase.storage.from("journal-media").remove(paths)
        }
      }
      return deleteJournalEntry(supabase, entryId)
    },

    onMutate: async (entryId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.journal.all(userId) })
      const previous = queryClient.getQueryData<JournalEntry[]>(queryKeys.journal.all(userId))

      queryClient.setQueryData<JournalEntry[]>(queryKeys.journal.all(userId), (old = []) =>
        old.filter((e) => e.id !== entryId)
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.journal.all(userId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.all(userId) })
    },
  })

  const uploadMediaMutation = useMutation({
    mutationFn: (file: File) => uploadJournalMedia(supabase, userId, file),
  })

  return {
    // Data
    entries,

    // State
    isLoading,
    error,

    // Actions — mutateAsync for create & upload so callers can await the result
    createEntry: createEntryMutation.mutateAsync,
    updateEntry: updateEntryMutation.mutate,
    deleteEntry: deleteEntryMutation.mutate,
    uploadMedia: uploadMediaMutation.mutateAsync,

    // Mutation states
    isCreating: createEntryMutation.isPending,
    isUpdating: updateEntryMutation.isPending,
    isDeleting: deleteEntryMutation.isPending,
    isUploading: uploadMediaMutation.isPending,
  }
}

export default useJournal
