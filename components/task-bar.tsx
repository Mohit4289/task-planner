"use client"

import type React from "react"

import type { Task, TaskCategory } from "@/types/task"
import { cn } from "@/lib/utils"
import { X, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isSameDay } from "date-fns"

interface TaskBarProps {
  task: Task
  date: Date
  onUpdate: (taskId: string, updates: Partial<Task>) => void
  onDelete: (taskId: string) => void
  onDragStart: (
    task: Task,
    dragType: "move" | "resize-start" | "resize-end",
    event: React.MouseEvent,
    clickedDate: Date,
  ) => void
  onClick: (task: Task, event: React.MouseEvent) => void
  onDoubleClick: (task: Task, event: React.MouseEvent) => void
  isDragging?: boolean
}

const CATEGORY_COLORS: Record<TaskCategory, string> = {
  "To Do": "bg-chart-1 text-white",
  "In Progress": "bg-chart-2 text-white",
  Review: "bg-chart-3 text-white",
  Completed: "bg-chart-4 text-white",
}

export function TaskBar({
  task,
  date,
  onUpdate,
  onDelete,
  onDragStart,
  onClick,
  onDoubleClick,
  isDragging,
}: TaskBarProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(task.id)
  }

  const isTaskStart = isSameDay(date, task.startDate)
  const isTaskEnd = isSameDay(date, task.endDate)
  const isMultiDay = !isSameDay(task.startDate, task.endDate)

  const handleMouseDown = (e: React.MouseEvent) => {
    onDragStart(task, "move", e, date)
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDragStart(task, "resize-start", e, date)
  }

  const handleResizeEnd = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDragStart(task, "resize-end", e, date)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      onClick(task, e)
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      onDoubleClick(task, e)
    }
  }

  return (
    <div
      data-task-bar
      className={cn(
        "group relative px-2 py-1 rounded text-xs font-medium transition-all",
        "flex items-center justify-between gap-1",
        CATEGORY_COLORS[task.category],
        isDragging ? "opacity-70 cursor-grabbing shadow-lg scale-105" : "cursor-grab hover:shadow-md",
        "select-none",
      )}
      title={`${task.name} (${task.category})`}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {isMultiDay && isTaskStart && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 cursor-w-resize opacity-0 group-hover:opacity-100 bg-white/30 hover:bg-white/50 transition-opacity"
          onMouseDown={handleResizeStart}
          title="Drag to change start date"
        />
      )}

      <div className="flex items-center gap-1 flex-1 min-w-0">
        <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-70 flex-shrink-0" />
        <span className="truncate flex-1">{task.name}</span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100 h-4 w-4 p-0 hover:bg-white/20 flex-shrink-0"
        onClick={handleDelete}
      >
        <X className="h-3 w-3" />
      </Button>

      {isMultiDay && isTaskEnd && (
        <div
          className="absolute right-0 top-0 bottom-0 w-1 cursor-e-resize opacity-0 group-hover:opacity-100 bg-white/30 hover:bg-white/50 transition-opacity"
          onMouseDown={handleResizeEnd}
          title="Drag to change end date"
        />
      )}
    </div>
  )
}
