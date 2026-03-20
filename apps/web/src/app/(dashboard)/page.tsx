"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import useDashboard from "@/lib/hooks/useDashboard"
import { getTodayDayOfWeek, capitalize } from "@lifeboard/lib"
import TasksCard from "@/components/dashboard/TasksCard"
import HabitsCard from "@/components/dashboard/HabitsCard"
import RemindersCard from "@/components/dashboard/RemindersCard"
import PlansCard from "@/components/dashboard/PlansCard"
import ReadingCard from "@/components/dashboard/ReadingCard"
import JournalCard from "@/components/dashboard/JournalCard"
import WeeklyStatsCard from "@/components/dashboard/WeeklyStatsCard"
import QuickActions from "@/components/dashboard/QuickActions"

const useUser = () => {
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

const QUOTES = [
  "The secret of getting ahead is getting started.",
  "Small daily improvements are the key to staggering long-term results.",
  "What you do today can improve all your tomorrows.",
  "Discipline is choosing between what you want now and what you want most.",
  "The only way to do great work is to love what you do.",
  "Progress, not perfection, is what we should be asking of ourselves.",
  "Your future is created by what you do today, not tomorrow.",
  "Consistency is what transforms average into excellence.",
  "Every expert was once a beginner.",
  "A goal without a plan is just a wish.",
]

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

const DashboardPage = () => {
  const { data: user } = useUser()
  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "there"

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const todayQuote = QUOTES[new Date().getDay() % QUOTES.length]
  const today = getTodayDayOfWeek()

  const {
    todaysTasks,
    weeklyStats,
    tasksByDay,
    upcomingReminders,
    activePlans,
    habitsToday,
    habitProgress,
    longestHabitStreak,
    allHabitsCompletedToday,
    currentlyReading,
    readingStreak,
    booksReadThisYear,
    yearlyReadingGoal,
    lastJournalEntry,
    journalEntriesThisMonth,
    journalEntriesThisWeek,
    toggleTask,
    createTask,
    logHabit,
    unlogHabit,
    isLoading,
    isCreatingTask,
  } = useDashboard(user?.id ?? "")

  const weekCompletion =
    weeklyStats.total > 0
      ? Math.round((weeklyStats.completed / weeklyStats.total) * 100)
      : 0

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#6C47FF] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative p-8 overflow-hidden">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute -left-[100px] -top-[100px] h-[350px] w-[350px] rounded-full bg-brand opacity-[0.12] blur-[80px] animate-orb-drift-1" />
      <div className="pointer-events-none absolute -bottom-[60px] -right-[80px] h-[280px] w-[280px] rounded-full bg-violet-500 opacity-[0.10] blur-[80px] animate-orb-drift-2" />
      <div className="pointer-events-none absolute left-[55%] top-[30%] h-[200px] w-[200px] rounded-full bg-violet-900 opacity-[0.08] blur-[80px] animate-orb-drift-1" />

      {/* Grid overlay */}
      <div className="auth-grid-overlay pointer-events-none absolute inset-0 opacity-50" />

      {/* Header */}
      <div className="relative mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">
          {getGreeting()}, {displayName}
        </h1>
        <p
          className="text-sm italic text-white/30 mb-3 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          &ldquo;{todayQuote}&rdquo;
        </p>
        <p className="text-sm text-white/40">
          {formattedDate} &middot; {formattedTime}
        </p>

        {/* Quick stat pills */}
        <div className="flex flex-wrap gap-3 mt-4">
          <span className="bg-white/5 rounded-full px-4 py-1.5 text-sm text-white/60">
            {todaysTasks.filter((t) => !t.is_complete).length} tasks today
          </span>
          <span className="bg-white/5 rounded-full px-4 py-1.5 text-sm text-white/60">
            {longestHabitStreak} day streak
          </span>
          <span className="bg-white/5 rounded-full px-4 py-1.5 text-sm text-white/60">
            {booksReadThisYear} books read
          </span>
          <span className="bg-white/5 rounded-full px-4 py-1.5 text-sm text-white/60">
            {weekCompletion}% week complete
          </span>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="lg:col-span-2 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <TasksCard
            todaysTasks={todaysTasks}
            toggleTask={toggleTask}
            createTask={createTask}
            isCreatingTask={isCreatingTask}
            dayName={capitalize(today)}
          />
        </div>

        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <HabitsCard
            habitsToday={habitsToday}
            habitProgress={habitProgress}
            logHabit={logHabit}
            unlogHabit={unlogHabit}
            longestHabitStreak={longestHabitStreak}
            allCompleted={allHabitsCompletedToday}
          />
        </div>

        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <RemindersCard reminders={upcomingReminders.slice(0, 3)} />
        </div>

        <div
          className="lg:col-span-2 animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <PlansCard activePlans={activePlans} />
        </div>

        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          <ReadingCard
            currentlyReading={currentlyReading}
            readingStreak={readingStreak}
            booksReadThisYear={booksReadThisYear}
            yearlyReadingGoal={yearlyReadingGoal}
          />
        </div>

        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "0.6s" }}
        >
          <JournalCard
            lastJournalEntry={lastJournalEntry}
            entriesThisMonth={journalEntriesThisMonth}
          />
        </div>

        <div
          className="lg:col-span-4 md:col-span-2 animate-fade-in-up"
          style={{ animationDelay: "0.7s" }}
        >
          <WeeklyStatsCard
            weeklyStats={weeklyStats}
            tasksByDay={tasksByDay}
            habitsToday={habitsToday}
            journalEntriesThisWeek={journalEntriesThisWeek}
            readingStreak={readingStreak}
          />
        </div>
      </div>

      <QuickActions />
    </div>
  )
}

export default DashboardPage
