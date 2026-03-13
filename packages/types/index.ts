// ─── AUTH ──────────────────────────────────────────────────────────────────
export type User = {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
}

// ─── TASKS ────────────────────────────────────────────────────────────────────
export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"

export type TaskColorTag =
  | "purple"
  | "blue"
  | "green"
  | "yellow"
  | "red"
  | "orange"
  | "gray"

export type Task = {
  id: string
  user_id: string
  day_of_week: DayOfWeek
  title: string
  duration_minutes: number | null
  is_complete: boolean
  carry_over: boolean
  color_tag: TaskColorTag | null
  created_at: string
}

export type CreateTaskInput = Omit<Task, "id" | "user_id" | "created_at">
export type UpdateTaskInput = Partial<Omit<Task, "id" | "user_id" | "created_at">>

// ─── JOURNAL ─────────────────────────────────────────────────────────────────
export type MoodType =
  | "great"
  | "good"
  | "okay"
  | "low"
  | "bad"

export type JournalEntry = {
  id: string
  user_id: string
  title: string | null
  content: string // rich text as JSON string (TipTap/ProseMirror format)
  mood: MoodType | null
  media_urls: string[]
  created_at: string
  updated_at: string
}

export type CreateJournalEntryInput = Omit<JournalEntry, "id" | "user_id" | "created_at" | "updated_at">

// ─── REMINDERS ───────────────────────────────────────────────────────────────
export type ReminderType = "birthday" | "health" | "custom"
export type ReminderRecurrence = "once" | "daily" | "weekly" | "monthly" | "yearly"

export type Reminder = {
  id: string
  user_id: string
  type: ReminderType
  title: string
  description: string | null
  trigger_at: string // ISO datetime
  recurrence: ReminderRecurrence
  is_active: boolean
  created_at: string
}

export type CreateReminderInput = Omit<Reminder, "id" | "user_id" | "created_at">

// ─── PLANNER ─────────────────────────────────────────────────────────────────
export type PlanTemplateType =
  | "content"
  | "event"
  | "study"
  | "personal"
  | "nysc"
  | "custom"

export type Plan = {
  id: string
  user_id: string
  title: string
  goal: string | null
  deadline: string | null // ISO date
  template_type: PlanTemplateType
  is_pinned: boolean
  created_at: string
}

export type PlanMilestone = {
  id: string
  plan_id: string
  title: string
  is_complete: boolean
  order_index: number
  due_date: string | null
}

export type PlanTask = {
  id: string
  milestone_id: string
  title: string
  is_complete: boolean
  order_index: number
}

export type CreatePlanInput = Omit<Plan, "id" | "user_id" | "created_at">

// ─── HABITS ──────────────────────────────────────────────────────────────────
export type HabitFrequency = "daily" | "weekly"
export type HabitCategory =
  | "health"
  | "fitness"
  | "learning"
  | "mindfulness"
  | "social"
  | "finance"
  | "custom"

export type Habit = {
  id: string
  user_id: string
  name: string
  frequency: HabitFrequency
  category: HabitCategory
  scheduled_days: number[] // 0=Sun..6=Sat, empty=every day
  is_archived: boolean
  created_at: string
}

export type HabitLog = {
  id: string
  habit_id: string
  completed_on: string // ISO date YYYY-MM-DD
}

export type CreateHabitInput = Omit<Habit, "id" | "user_id" | "created_at" | "is_archived">

// ─── BOOKS ───────────────────────────────────────────────────────────────────
export type BookFileType = "pdf" | "epub"

export type Book = {
  id: string
  user_id: string
  title: string
  author: string | null
  file_url: string
  cover_url: string | null
  file_type: BookFileType
  total_pages: number | null
  created_at: string
}

export type BookProgress = {
  id: string
  book_id: string
  user_id: string
  current_page: number
  last_read_at: string
}

export type BookNote = {
  id: string
  book_id: string
  user_id: string
  page_number: number
  note_text: string
  highlight_text: string | null
  created_at: string
}

export type ReadingGoal = {
  id: string
  user_id: string
  year: number
  month: number | null // null = yearly goal
  target_count: number
  created_at: string
}

export type CreateBookInput = Omit<Book, "id" | "user_id" | "created_at">

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
export type DashboardSummary = {
  todays_tasks: Task[]
  upcoming_reminders: Reminder[]
  active_plans: (Plan & { progress_percent: number })[]
  habits_today: (Habit & { completed_today: boolean })[]
  currently_reading: (Book & { progress: BookProgress | null }) | null
  weekly_task_stats: {
    total: number
    completed: number
  }
}
