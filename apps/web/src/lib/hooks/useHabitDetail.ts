"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import {
  queryKeys,
  fetchHabitLogs,
  calculateStreak,
  calculateLongestStreak,
  calculateCompletionRate,
} from "@lifeboard/lib"

const useHabitDetailHook = (userId: string, habitId: string) => {
  const supabase = createClient()

  const {
    data: logs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.habits.logs(userId, habitId),
    queryFn: () => fetchHabitLogs(supabase, habitId),
    enabled: !!userId && !!habitId,
  })

  const logDates = useMemo(() => logs.map((l) => l.completed_on), [logs])
  const currentStreak = useMemo(() => calculateStreak(logDates), [logDates])
  const longestStreak = useMemo(() => calculateLongestStreak(logDates), [logDates])
  const completionRate = useMemo(() => calculateCompletionRate(logDates), [logDates])
  const totalCheckIns = logs.length

  return {
    logs,
    logDates,
    currentStreak,
    longestStreak,
    completionRate,
    totalCheckIns,
    isLoading,
    error,
  }
}

export default useHabitDetailHook
