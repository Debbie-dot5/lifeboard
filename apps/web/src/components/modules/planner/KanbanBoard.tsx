"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus, X, GripVertical, Check, Calendar } from "lucide-react"
import type { PlanMilestone, PlanTask } from "@lifeboard/types"

type MilestoneWithTasks = PlanMilestone & { plan_tasks: PlanTask[] }

type Props = {
  milestones: MilestoneWithTasks[]
  onCreateMilestone: (input: { title: string; order_index: number; due_date?: string | null }) => void
  onUpdateMilestone: (milestoneId: string, updates: Partial<Omit<PlanMilestone, "id" | "plan_id">>) => void
  onDeleteMilestone: (milestoneId: string) => void
  onCreateTask: (input: { milestone_id: string; title: string; order_index: number }) => void
  onUpdateTask: (taskId: string, updates: Partial<Omit<PlanTask, "id" | "milestone_id">>) => void
  onDeleteTask: (taskId: string) => void
  onToggleTask: (taskId: string, isComplete: boolean) => void
}

// ── SORTABLE TASK CARD ─────────────────────────────────────────────────────

const SortableTaskCard = ({
  task,
  onToggle,
  onUpdate,
  onDelete,
}: {
  task: PlanTask
  onToggle: () => void
  onUpdate: (title: string) => void
  onDelete: () => void
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleSave = () => {
    const trimmed = editTitle.trim()
    if (trimmed && trimmed !== task.title) {
      onUpdate(trimmed)
    } else {
      setEditTitle(task.title)
    }
    setIsEditing(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group/task flex items-start gap-2 bg-[#0F0F1A] border border-white/5 rounded-lg p-3 transition-colors hover:border-white/10 ${
        task.is_complete ? "opacity-50" : ""
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 cursor-grab opacity-0 group-hover/task:opacity-100 transition-opacity"
      >
        <GripVertical size={12} className="text-white/20" />
      </button>

      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
          task.is_complete
            ? "bg-[#6C47FF] border-[#6C47FF]"
            : "border-white/20 hover:border-[#6C47FF]"
        }`}
      >
        {task.is_complete && <Check size={10} className="text-white" />}
      </button>

      {/* Title */}
      {isEditing ? (
        <input
          autoFocus
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave()
            if (e.key === "Escape") { setEditTitle(task.title); setIsEditing(false) }
          }}
          className="flex-1 bg-transparent text-sm text-white outline-none border-b border-[#6C47FF] pb-0.5"
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className={`flex-1 text-sm cursor-text ${
            task.is_complete ? "text-white/30 line-through" : "text-white/80"
          }`}
        >
          {task.title}
        </span>
      )}

      {/* Delete */}
      <button
        onClick={onDelete}
        className="mt-0.5 opacity-0 group-hover/task:opacity-100 transition-opacity"
      >
        <X size={12} className="text-white/20 hover:text-red-400" />
      </button>
    </div>
  )
}

// ── MILESTONE COLUMN ───────────────────────────────────────────────────────

const MilestoneColumn = ({
  milestone,
  onUpdateMilestone,
  onDeleteMilestone,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
}: {
  milestone: MilestoneWithTasks
  onUpdateMilestone: (updates: Partial<Omit<PlanMilestone, "id" | "plan_id">>) => void
  onDeleteMilestone: () => void
  onCreateTask: (input: { milestone_id: string; title: string; order_index: number }) => void
  onUpdateTask: (taskId: string, updates: Partial<Omit<PlanTask, "id" | "milestone_id">>) => void
  onDeleteTask: (taskId: string) => void
  onToggleTask: (taskId: string, isComplete: boolean) => void
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState(milestone.title)
  const [newTaskTitle, setNewTaskTitle] = useState("")

  const completedCount = milestone.plan_tasks.filter((t) => t.is_complete).length
  const totalCount = milestone.plan_tasks.length

  const handleSaveTitle = () => {
    const trimmed = editTitle.trim()
    if (trimmed && trimmed !== milestone.title) {
      onUpdateMilestone({ title: trimmed })
    } else {
      setEditTitle(milestone.title)
    }
    setIsEditingTitle(false)
  }

  const handleAddTask = () => {
    const trimmed = newTaskTitle.trim()
    if (!trimmed) return
    onCreateTask({
      milestone_id: milestone.id,
      title: trimmed,
      order_index: milestone.plan_tasks.length,
    })
    setNewTaskTitle("")
  }

  return (
    <div className="flex-shrink-0 w-[280px] bg-[#13131F] border border-white/5 rounded-xl flex flex-col max-h-full">
      {/* Column header */}
      <div className="p-3 border-b border-white/5">
        <div className="flex items-center justify-between mb-1">
          {isEditingTitle ? (
            <input
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle()
                if (e.key === "Escape") { setEditTitle(milestone.title); setIsEditingTitle(false) }
              }}
              className="flex-1 bg-transparent text-sm font-semibold text-white outline-none border-b border-[#6C47FF] pb-0.5"
            />
          ) : (
            <h3
              onClick={() => setIsEditingTitle(true)}
              className="text-sm font-semibold text-white cursor-text flex-1"
            >
              {milestone.title}
            </h3>
          )}

          <div className="flex items-center gap-1 ml-2">
            <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
              {completedCount}/{totalCount}
            </span>
            <button
              onClick={onDeleteMilestone}
              className="p-0.5 rounded hover:bg-white/5 transition-colors"
            >
              <X size={12} className="text-white/20 hover:text-red-400" />
            </button>
          </div>
        </div>

        {/* Due date */}
        <div className="flex items-center gap-1">
          <Calendar size={10} className="text-white/20" />
          <input
            type="date"
            value={milestone.due_date ?? ""}
            onChange={(e) => onUpdateMilestone({ due_date: e.target.value || null })}
            className="bg-transparent text-[10px] text-white/30 outline-none [color-scheme:dark] cursor-pointer"
          />
        </div>

        {/* Completion checkbox */}
        <button
          onClick={() => onUpdateMilestone({ is_complete: !milestone.is_complete })}
          className="flex items-center gap-1.5 mt-2"
        >
          <div
            className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
              milestone.is_complete
                ? "bg-green-500 border-green-500"
                : "border-white/20 hover:border-green-500/50"
            }`}
          >
            {milestone.is_complete && <Check size={8} className="text-white" />}
          </div>
          <span className="text-[10px] text-white/30">
            {milestone.is_complete ? "Completed" : "Mark complete"}
          </span>
        </button>
      </div>

      {/* Tasks list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <SortableContext
          items={milestone.plan_tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {milestone.plan_tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onToggle={() => onToggleTask(task.id, !task.is_complete)}
              onUpdate={(title) => onUpdateTask(task.id, { title })}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add task input */}
      <div className="p-2 border-t border-white/5">
        <div className="flex items-center gap-2">
          <input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddTask() }}
            placeholder="Add a task..."
            className="flex-1 bg-white/5 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#6C47FF]/50 transition-colors"
          />
          <button
            onClick={handleAddTask}
            disabled={!newTaskTitle.trim()}
            className="p-1.5 rounded-lg bg-[#6C47FF]/20 text-[#6C47FF] hover:bg-[#6C47FF]/30 transition-colors disabled:opacity-30"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── KANBAN BOARD ───────────────────────────────────────────────────────────

const KanbanBoard = ({
  milestones,
  onCreateMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTask,
}: Props) => {
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("")
  const [showAddMilestone, setShowAddMilestone] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    // Find which milestone the task belongs to
    for (const milestone of milestones) {
      const taskIds = milestone.plan_tasks.map((t) => t.id)
      const oldIndex = taskIds.indexOf(active.id as string)
      const newIndex = taskIds.indexOf(over.id as string)

      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder within the same milestone
        const reordered = arrayMove(milestone.plan_tasks, oldIndex, newIndex)
        reordered.forEach((task, index) => {
          if (task.order_index !== index) {
            onUpdateTask(task.id, { order_index: index })
          }
        })
        break
      }
    }
  }

  const handleAddMilestone = () => {
    const trimmed = newMilestoneTitle.trim()
    if (!trimmed) return
    onCreateMilestone({
      title: trimmed,
      order_index: milestones.length,
    })
    setNewMilestoneTitle("")
    setShowAddMilestone(false)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-280px)]">
        {milestones.map((milestone) => (
          <MilestoneColumn
            key={milestone.id}
            milestone={milestone}
            onUpdateMilestone={(updates) => onUpdateMilestone(milestone.id, updates)}
            onDeleteMilestone={() => {
              if (window.confirm(`Delete milestone "${milestone.title}" and all its tasks?`)) {
                onDeleteMilestone(milestone.id)
              }
            }}
            onCreateTask={onCreateTask}
            onUpdateTask={(taskId, updates) => onUpdateTask(taskId, updates)}
            onDeleteTask={(taskId) => onDeleteTask(taskId)}
            onToggleTask={onToggleTask}
          />
        ))}

        {/* Add milestone button */}
        {showAddMilestone ? (
          <div className="flex-shrink-0 w-[280px] bg-[#13131F] border border-dashed border-[#6C47FF]/30 rounded-xl p-3">
            <input
              autoFocus
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddMilestone()
                if (e.key === "Escape") { setNewMilestoneTitle(""); setShowAddMilestone(false) }
              }}
              placeholder="Milestone title..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6C47FF] transition-colors mb-2"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddMilestone}
                disabled={!newMilestoneTitle.trim()}
                className="flex-1 py-1.5 bg-[#6C47FF] text-white text-xs font-medium rounded-lg hover:bg-[#5835FF] transition-colors disabled:opacity-50"
              >
                Add
              </button>
              <button
                onClick={() => { setNewMilestoneTitle(""); setShowAddMilestone(false) }}
                className="px-3 py-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddMilestone(true)}
            className="flex-shrink-0 w-[280px] h-[80px] border border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 text-sm text-[#6C47FF] hover:border-[#6C47FF]/30 hover:bg-[#6C47FF]/5 transition-all"
          >
            <Plus size={16} />
            Add Milestone
          </button>
        )}
      </div>
    </DndContext>
  )
}

export default KanbanBoard
