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
    <div className="p-4 md:p-6 lg:p-8 pt-20 md:pt-6 lg:pt-8">
      <div className="flex flex-col md:flex-row items-start md:justify-between gap-3 md:gap-0 mb-6 md:mb-8">
        <div>
          <h1
            className="text-2xl font-bold text-white mb-1"
            style={{ fontFamily: "var(--font-clash)", letterSpacing: "-0.03em" }}
          >
            Weekly Tasks
          </h1>
          <p className="text-white/40 text-sm">
            {weeklyStats.completed} of {weeklyStats.total} tasks completed this week
          </p>
        </div>
        <div className="w-full md:w-auto md:text-right">
          <div className="font-mono text-xs text-white/30 mb-1">
            {weeklyStats.total > 0 ? Math.round((weeklyStats.completed / weeklyStats.total) * 100) : 0}% done
          </div>
          <div className="w-full md:w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
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
              className={`flex-shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm font-medium transition-all ${
                isActive ? "text-white" : "text-white/50 hover:text-white"
              }`}
              style={
                isActive
                  ? { background: "rgba(108,71,255,0.2)", border: "1px solid rgba(108,71,255,0.3)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 0 20px rgba(108,71,255,0.15)" }
                  : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              <span className="capitalize">{day.slice(0, 3)}</span>
              {day === today && <span className="ml-1.5 w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />}
              {dayTasks.length > 0 && <span className="ml-2 text-xs opacity-60">{dayComplete}/{dayTasks.length}</span>}
            </button>
          )
        })}
      </div>

      <div className="rounded-xl p-4 md:p-5 lg:p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
        <h2 className="font-semibold capitalize text-white mb-4 flex items-center gap-2">
          {activeDay}
          {activeDay === today && (
            <span className="text-xs text-[#6C47FF] px-2 py-0.5 rounded-full font-normal" style={{ background: "rgba(108,71,255,0.12)", border: "1px solid rgba(108,71,255,0.2)", backdropFilter: "blur(8px)" }}>Today</span>
          )}
        </h2>

        <div className="space-y-2 mb-4">
          {pendingTasks.length === 0 && completedTasks.length === 0 && (
            <p className="text-white/20 text-sm py-4 text-center">No tasks yet — add one below</p>
          )}
          {pendingTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-4 md:p-3 min-h-[48px] md:min-h-0 rounded-lg hover:bg-white/5 group transition-all">
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
                <div key={task.id} className="flex items-center gap-3 p-4 md:p-3 min-h-[48px] md:min-h-0 rounded-lg opacity-40">
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

        <div className="flex flex-col md:flex-row gap-2 mt-6 pt-4 border-t border-white/5">
          <input
            type="text"
            placeholder="Add a task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            className="w-full md:flex-1 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 glass-input"
          />
          <div className="flex gap-2 md:contents">
            <input
              type="number"
              placeholder="mins"
              value={newTaskDuration}
              onChange={(e) => setNewTaskDuration(e.target.value)}
              className="flex-1 md:flex-none md:w-20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 glass-input"
            />
            <button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim() || isCreating}
              className="px-4 py-2 text-white text-sm font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-11"
              style={{ background: "linear-gradient(135deg, rgba(108,71,255,0.9), rgba(79,47,224,0.9))", border: "1px solid rgba(108,71,255,0.5)", boxShadow: "0 4px 20px rgba(108,71,255,0.3), inset 0 1px 0 rgba(255,255,255,0.2)" }}
            >
              {isCreating ? "..." : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TasksPage
