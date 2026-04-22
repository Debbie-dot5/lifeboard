"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import {
  queryKeys,
  fetchReadingGoals,
  createReadingGoal,
  updateReadingGoal,
} from "@lifeboard/lib"
import type { ReadingGoal } from "@lifeboard/types"

// ── USER QUERY ──────────────────────────────────────────────────────────────

export const useUser = () => {
  const supabase = createClient()
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      return user
    },
  })
}

// ── SETTINGS HOOK ───────────────────────────────────────────────────────────

const useSettings = (userId: string) => {
  const supabase = createClient()
  const queryClient = useQueryClient()

  // ── READING GOALS ─────────────────────────────────────────────────────────
  const { data: readingGoals = [] } = useQuery({
    queryKey: queryKeys.books.goals(userId),
    queryFn: () => fetchReadingGoals(supabase, userId),
    enabled: !!userId,
  })

  // ── UPDATE DISPLAY NAME ───────────────────────────────────────────────────
  const updateNameMutation = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: name },
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
  })

  // ── UPDATE PASSWORD ───────────────────────────────────────────────────────
  const updatePasswordMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (error) throw error
    },
  })

  // ── UPDATE EMAIL ──────────────────────────────────────────────────────────
  const updateEmailMutation = useMutation({
    mutationFn: async (newEmail: string) => {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      })
      if (error) throw error
    },
  })

  // ── UPLOAD AVATAR ─────────────────────────────────────────────────────────
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split(".").pop()
      const filePath = `${userId}/avatar.${ext}`

      // Upload to "avatars" bucket
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath)

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      })
      if (updateError) throw updateError

      return publicUrl
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
  })

  // ── READING GOAL (quick set) ──────────────────────────────────────────────
  const upsertGoalMutation = useMutation({
    mutationFn: async ({
      goalId,
      target,
    }: {
      goalId?: string
      target: number
    }) => {
      if (goalId) {
        return updateReadingGoal(supabase, goalId, target)
      }
      const currentYear = new Date().getFullYear()
      return createReadingGoal(supabase, userId, {
        year: currentYear,
        target_count: target,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.books.goals(userId),
      })
    },
  })

  // ── DELETE ACCOUNT ────────────────────────────────────────────────────────
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("delete_user")
      if (error) throw error
      await supabase.auth.signOut()
    },
  })

  // ── COMPUTED ──────────────────────────────────────────────────────────────
  const currentYear = new Date().getFullYear()
  const yearlyGoal = readingGoals.find(
    (g: ReadingGoal) => g.year === currentYear && !g.month
  )

  return {
    // reading goals
    readingGoals,
    yearlyGoal,
    upsertGoal: upsertGoalMutation.mutateAsync,
    isUpsertingGoal: upsertGoalMutation.isPending,

    // profile
    updateName: updateNameMutation.mutateAsync,
    isUpdatingName: updateNameMutation.isPending,

    // password
    updatePassword: updatePasswordMutation.mutateAsync,
    isUpdatingPassword: updatePasswordMutation.isPending,

    // email
    updateEmail: updateEmailMutation.mutateAsync,
    isUpdatingEmail: updateEmailMutation.isPending,

    // avatar
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isUploading: uploadAvatarMutation.isPending,

    // delete
    deleteAccount: deleteAccountMutation.mutateAsync,
    isDeletingAccount: deleteAccountMutation.isPending,
  }
}

export default useSettings
