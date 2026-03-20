"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDuration, getTodayDayOfWeek } from "@lifeboard/lib"
import type { Task } from "@lifeboard/types"

type Props = {
  todaysTasks: Task[]
  toggleTask: (taskId: string, isComplete: boolean) => void
  createTask: (input: Omit<Task, "id" | "user_id" | "created_at" | "is_complete">) => void
  isCreatingTask: boolean
  dayName: string
}

const TasksCard = ({ todaysTasks, toggleTask, createTask, isCreatingTask, dayName }: Props) => {
  const [newTitle, setNewTitle] = useState("")

  const pending = todaysTasks.filter((t) => !t.is_complete)
  const done = todaysTasks.filter((t) => t.is_complete)
  const progress =
    todaysTasks.length > 0
      ? Math.round((done.length / todaysTasks.length) * 100)
      : 0

  const handleAdd = () => {
    const title = newTitle.trim()
    if (!title) return
    createTask({
      title,
      day_of_week: getTodayDayOfWeek(),
      duration_minutes: 30,
      color_tag: "purple",
      carry_over: false,
    })
    setNewTitle("")
  }

  return (
    <div className="relative bg-[#13131F] rounded-2xl border border-white/[0.06] border-l-[3px] border-l-[#6C47FF] p-6 h-full hover:border-[#6C47FF]/30 hover:shadow-[0_0_30px_rgba(108,71,255,0.1)] hover:scale-[1.01] transition-all duration-200 group">
      {/* Floating icon */}
      <span className="absolute top-4 right-4 text-lg opacity-60 animate-float-bob">
        📋
      </span>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">Today&apos;s Tasks</h3>
          <span className="text-xs text-white/30">{dayName}</span>
        </div>
        <Link
          href="/tasks"
          className="text-xs text-white/40 hover:text-[#6C47FF] transition-colors"
        >
          View all &rarr;
        </Link>
      </div>

      {/* Task list */}
      {todaysTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-white/30">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3 text-2xl">
            ✨
          </div>
          <p className="text-sm font-medium mb-1">No tasks for today</p>
          <Link href="/tasks" className="text-xs text-[#6C47FF] hover:underline">
            Plan your day &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-1 mb-4 max-h-[220px] overflow-y-auto">
          {/* Pending */}
          {pending.slice(0, 5).map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 py-1.5 px-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <button
                onClick={() => toggleTask(task.id, true)}
                className="w-[18px] h-[18px] rounded border border-white/20 hover:border-[#6C47FF] transition-colors flex-shrink-0"
              />
              <span className="text-sm text-white truncate flex-1">
                {task.title}
              </span>
              {task.duration_minutes != null && task.duration_minutes > 0 && (
                <span className="text-xs text-white/20 flex-shrink-0">
                  {formatDuration(task.duration_minutes)}
                </span>
              )}
            </div>
          ))}
          {pending.length > 5 && (
            <p className="text-xs text-white/20 pl-8">
              +{pending.length - 5} more
            </p>
          )}

          {/* Done */}
          {done.length > 0 && (
            <>
              <div className="border-t border-white/5 my-2" />
              {done.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 py-1.5 px-1 opacity-40"
                >
                  <button
                    onClick={() => toggleTask(task.id, false)}
                    className="w-[18px] h-[18px] rounded bg-[#6C47FF] flex items-center justify-center flex-shrink-0"
                  >
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                    >
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <span className="text-sm text-white line-through truncate">
                    {task.title}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Progress bar */}
      {todaysTasks.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-white/40">
              {done.length} of {todaysTasks.length} done
            </span>
            <span className="text-xs text-white/40">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor:
                  progress === 100 ? "#22C55E" : "#6C47FF",
              }}
            />
          </div>
        </div>
      )}

      {/* Quick add */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Quick add task..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          disabled={isCreatingTask}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6C47FF] transition-colors disabled:opacity-40"
        />
      </div>
    </div>
  )
}

export default TasksCard
