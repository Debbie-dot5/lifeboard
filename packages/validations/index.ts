import { z } from "zod"

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  display_name: z.string().min(2, "Name must be at least 2 characters").max(50),
})

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>

// ─── TASKS ────────────────────────────────────────────────────────────────────
const DAY_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const
const COLOR_TAGS = ["purple", "blue", "green", "yellow", "red", "orange", "gray"] as const

export const createTaskSchema = z.object({
  day_of_week: z.enum(DAY_OF_WEEK),
  title: z.string().min(1, "Task title is required").max(200),
  duration_minutes: z.number().int().positive().nullable().optional(),
  carry_over: z.boolean().default(false),
  color_tag: z.enum(COLOR_TAGS).nullable().optional(),
})

export const updateTaskSchema = createTaskSchema.partial().extend({
  is_complete: z.boolean().optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

// ─── JOURNAL ──────────────────────────────────────────────────────────────────
const MOOD_TYPES = ["great", "good", "okay", "low", "bad"] as const

export const createJournalEntrySchema = z.object({
  title: z.string().max(200).nullable().optional(),
  content: z.string().min(1, "Journal entry cannot be empty"),
  mood: z.enum(MOOD_TYPES).nullable().optional(),
  media_urls: z.array(z.string().url()).default([]),
})

export const updateJournalEntrySchema = createJournalEntrySchema.partial()

export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>
export type UpdateJournalEntryInput = z.infer<typeof updateJournalEntrySchema>

// ─── REMINDERS ────────────────────────────────────────────────────────────────
const REMINDER_TYPES = ["birthday", "health", "custom"] as const
const RECURRENCE_TYPES = ["once", "daily", "weekly", "monthly", "yearly"] as const

export const createReminderSchema = z.object({
  type: z.enum(REMINDER_TYPES),
  title: z.string().min(1, "Reminder title is required").max(200),
  description: z.string().max(500).nullable().optional(),
  trigger_at: z.string().datetime("Invalid date format"),
  recurrence: z.enum(RECURRENCE_TYPES).default("once"),
  is_active: z.boolean().default(true),
})

export const updateReminderSchema = createReminderSchema.partial()

export type CreateReminderInput = z.infer<typeof createReminderSchema>
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>

// ─── PLANNER ──────────────────────────────────────────────────────────────────
const PLAN_TEMPLATE_TYPES = ["content", "event", "study", "personal", "nysc", "custom"] as const

export const createPlanSchema = z.object({
  title: z.string().min(1, "Plan title is required").max(200),
  goal: z.string().max(500).nullable().optional(),
  deadline: z.string().nullable().optional(), // ISO date
  template_type: z.enum(PLAN_TEMPLATE_TYPES).default("custom"),
  is_pinned: z.boolean().default(false),
})

export const createMilestoneSchema = z.object({
  plan_id: z.string().uuid(),
  title: z.string().min(1, "Milestone title is required").max(200),
  order_index: z.number().int().nonnegative(),
  due_date: z.string().nullable().optional(),
})

export const createPlanTaskSchema = z.object({
  milestone_id: z.string().uuid(),
  title: z.string().min(1, "Task title is required").max(200),
  order_index: z.number().int().nonnegative(),
})

export type CreatePlanInput = z.infer<typeof createPlanSchema>
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>
export type CreatePlanTaskInput = z.infer<typeof createPlanTaskSchema>

// ─── HABITS ───────────────────────────────────────────────────────────────────
const HABIT_FREQUENCIES = ["daily", "weekly"] as const
const HABIT_CATEGORIES = ["health", "fitness", "learning", "mindfulness", "social", "finance", "custom"] as const

export const createHabitSchema = z.object({
  name: z.string().min(1, "Habit name is required").max(100),
  frequency: z.enum(HABIT_FREQUENCIES).default("daily"),
  category: z.enum(HABIT_CATEGORIES).default("custom"),
  scheduled_days: z.array(z.number().int().min(0).max(6)).default([]),
})

export type CreateHabitInput = z.infer<typeof createHabitSchema>

// ─── BOOKS ────────────────────────────────────────────────────────────────────
const BOOK_FILE_TYPES = ["pdf", "epub"] as const

export const createBookSchema = z.object({
  title: z.string().min(1, "Book title is required").max(300),
  author: z.string().max(200).nullable().optional(),
  file_url: z.string().url("Invalid file URL"),
  cover_url: z.string().url().nullable().optional(),
  file_type: z.enum(BOOK_FILE_TYPES),
  total_pages: z.number().int().positive().nullable().optional(),
})

export const readingGoalSchema = z.object({
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12).nullable().optional(),
  target_count: z.number().int().positive("Goal must be at least 1 book"),
})

export const bookNoteSchema = z.object({
  book_id: z.string().uuid(),
  page_number: z.number().int().positive(),
  note_text: z.string().min(1).max(2000),
  highlight_text: z.string().max(1000).nullable().optional(),
})

export type CreateBookInput = z.infer<typeof createBookSchema>
export type ReadingGoalInput = z.infer<typeof readingGoalSchema>
export type BookNoteInput = z.infer<typeof bookNoteSchema>
