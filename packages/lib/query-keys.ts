/**
 * Centralized query keys for TanStack Query.
 * Shared between web and mobile so cache keys are always consistent.
 *
 * Usage:
 *   import { queryKeys } from "@lifeboard/lib"
 *   useQuery({ queryKey: queryKeys.tasks.byDay(userId, "monday") })
 */

export const queryKeys = {
  // ── TASKS ────────────────────────────────────────────────────────────────
  tasks: {
    all: (userId: string) => ["tasks", userId] as const,
    byDay: (userId: string, day: string) => ["tasks", userId, day] as const,
    weekly: (userId: string) => ["tasks", userId, "weekly"] as const,
  },

  // ── JOURNAL ──────────────────────────────────────────────────────────────
  journal: {
    all: (userId: string) => ["journal", userId] as const,
    entry: (userId: string, entryId: string) => ["journal", userId, entryId] as const,
  },

  // ── REMINDERS ────────────────────────────────────────────────────────────
  reminders: {
    all: (userId: string) => ["reminders", userId] as const,
    upcoming: (userId: string) => ["reminders", userId, "upcoming"] as const,
  },

  // ── PLANNER ──────────────────────────────────────────────────────────────
  plans: {
    all: (userId: string) => ["plans", userId] as const,
    plan: (userId: string, planId: string) => ["plans", userId, planId] as const,
    pinned: (userId: string) => ["plans", userId, "pinned"] as const,
  },

  // ── HABITS ───────────────────────────────────────────────────────────────
  habits: {
    all: (userId: string) => ["habits", userId] as const,
    logs: (userId: string, habitId: string) => ["habits", userId, habitId, "logs"] as const,
    todayStatus: (userId: string) => ["habits", userId, "today"] as const,
  },

  // ── BOOKS ────────────────────────────────────────────────────────────────
  books: {
    all: (userId: string) => ["books", userId] as const,
    book: (userId: string, bookId: string) => ["books", userId, bookId] as const,
    progress: (userId: string, bookId: string) => ["books", userId, bookId, "progress"] as const,
    goals: (userId: string) => ["books", userId, "goals"] as const,
  },

  // ── DASHBOARD ────────────────────────────────────────────────────────────
  dashboard: {
    summary: (userId: string) => ["dashboard", userId, "summary"] as const,
  },
} as const
