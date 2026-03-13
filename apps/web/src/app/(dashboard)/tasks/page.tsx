"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import useTasks from "@/lib/hooks/useTasks"
import { getTodayDayOfWeek, formatDuration } from "@lifeboard/lib"
import type { DayOfWeek } from "@lifeboard/types"

const DAYS: DayOfWeek[] = [
  "monday", "tuesday", "wednesday",
  "thursday", "friday", "saturday", "sunday"
]

const useUser = () => {
  const supabase = createClient()
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },
  })
}

const TasksPage = () => {
  const { data: user } = useUser()
  const today = getTodayDayOfWeek()
  const [activeDay, setActiveDay] = useState<DayOfWeek>(today)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDuration, setNewTaskDuration] = useState("")

  const {
    tasksByDay,
    weeklyStats,
    isLoading,
    createTask,
    toggleComplete,
    deleteTask,
    isCreating,
  } = useTasks(user?.id ?? "")

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !user) return
    createTask({
      day_of_week: activeDay,
      title: newTaskTitle.trim(),
      duration_minutes: newTaskDuration ? parseInt(newTaskDuration) : null,
      carry_over: false,
      color_tag: null,
    })
    setNewTaskTitle("")
    setNewTaskDuration("")
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-white/30 text-sm">Loading tasks...</div>
      </div>
    )
  }

  const activeTasks = tasksByDay[activeDay] ?? []
  const completedTasks = activeTasks.filter((t) => t.is_complete)
  const pendingTasks = activeTasks.filter((t) => !t.is_complete)

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Weekly Tasks</h1>
          <p className="text-white/40 text-sm">
            {weeklyStats.completed} of {weeklyStats.total} tasks completed this week
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/30 mb-1">
            {weeklyStats.total > 0 ? Math.round((weeklyStats.completed / weeklyStats.total) * 100) : 0}% done
          </div>
          <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#6C47FF] rounded-full transition-all duration-500"
              style={{ width: `${weeklyStats.total > 0 ? (weeklyStats.completed / weeklyStats.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {DAYS.map((day) => {
          const dayTasks = tasksByDay[day] ?? []
          const dayComplete = dayTasks.filter((t) => t.is_complete).length
          const isActive = day === activeDay
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive ? "bg-[#6C47FF] text-white" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="capitalize">{day.slice(0, 3)}</span>
              {day === today && <span className="ml-1.5 w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />}
              {dayTasks.length > 0 && <span className="ml-2 text-xs opacity-60">{dayComplete}/{dayTasks.length}</span>}
            </button>
          )
        })}
      </div>

      <div className="bg-[#13131F] rounded-xl border border-white/5 p-6">
        <h2 className="font-semibold capitalize text-white mb-4 flex items-center gap-2">
          {activeDay}
          {activeDay === today && (
            <span className="text-xs bg-[#6C47FF]/20 text-[#6C47FF] px-2 py-0.5 rounded-full font-normal">Today</span>
          )}
        </h2>

        <div className="space-y-2 mb-4">
          {pendingTasks.length === 0 && completedTasks.length === 0 && (
            <p className="text-white/20 text-sm py-4 text-center">No tasks yet — add one below</p>
          )}
          {pendingTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 group transition-all">
              <button onClick={() => toggleComplete(task.id, true)} className="w-5 h-5 rounded border border-white/20 hover:border-[#6C47FF] transition-colors flex-shrink-0" />
              <span className="text-sm text-white flex-1">{task.title}</span>
              {task.duration_minutes && <span className="text-xs text-white/30">{formatDuration(task.duration_minutes)}</span>}
              <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all text-xs">✕</button>
            </div>
          ))}
        </div>

        {completedTasks.length > 0 && (
          <div className="border-t border-white/5 pt-4 mt-4">
            <p className="text-xs text-white/20 mb-2 uppercase tracking-wider">Done</p>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg opacity-40">
                  <button onClick={() => toggleComplete(task.id, false)} className="w-5 h-5 rounded bg-[#6C47FF] border border-[#6C47FF] flex-shrink-0 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </button>
                  <span className="text-sm text-white line-through">{task.title}</span>
                  {task.duration_minutes && <span className="text-xs text-white/30">{formatDuration(task.duration_minutes)}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-6 pt-4 border-t border-white/5">
          <input
            type="text"
            placeholder="Add a task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6C47FF] transition-colors"
          />
          <input
            type="number"
            placeholder="mins"
            value={newTaskDuration}
            onChange={(e) => setNewTaskDuration(e.target.value)}
            className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6C47FF] transition-colors"
          />
          <button
            onClick={handleAddTask}
            disabled={!newTaskTitle.trim() || isCreating}
            className="px-4 py-2 bg-[#6C47FF] text-white text-sm font-medium rounded-lg hover:bg-[#5835FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? "..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TasksPage
