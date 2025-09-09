"use client"

import type React from "react"

import { format } from "date-fns"
import type { Task } from "@/types/task"
import { TaskBar } from "./task-bar"
import { cn } from "@/lib/utils"

interface CalendarDayProps {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isDragging: boolean
  isTaskDragging: boolean
  tasks: Task[]
  onMouseDown: (event: React.MouseEvent) => void
  onMouseEnter: () => void
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete: (taskId: string) => void
  onTaskDragStart: (
    task: Task,
    dragType: "move" | "resize-start" | "resize-end",
    event: React.MouseEvent,
    clickedDate: Date,
  ) => void
  onTaskClick: (task: Task, event: React.MouseEvent) => void
  onTaskDoubleClick: (task: Task, event: React.MouseEvent) => void
}

export function CalendarDay({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  isDragging,
  isTaskDragging,
  tasks,
  onMouseDown,
  onMouseEnter,
  onTaskUpdate,
  onTaskDelete,
  onTaskDragStart,
  onTaskClick,
  onTaskDoubleClick,
}: CalendarDayProps) {
  return (
    <div
      className={cn(
        "min-h-[120px] bg-background p-2 transition-colors relative",
        "hover:bg-muted/50",
        isSelected && "bg-primary/10 ring-2 ring-primary/20",
        !isCurrentMonth && "text-muted-foreground bg-muted/30",
        isDragging ? "cursor-crosshair" : isTaskDragging ? "cursor-grabbing" : "cursor-pointer",
      )}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
    >
      <div className={cn("text-sm font-medium mb-2", isToday && "text-primary font-bold")}>{format(date, "d")}</div>

      <div className="space-y-1">
        {tasks.map((task) => (
          <TaskBar
            key={task.id}
            task={task}
            date={date}
            onUpdate={onTaskUpdate}
            onDelete={onTaskDelete}
            onDragStart={onTaskDragStart}
            onClick={onTaskClick}
            onDoubleClick={onTaskDoubleClick}
            isDragging={isTaskDragging}
          />
        ))}
      </div>

      {isSelected && isDragging && (
        <div className="absolute inset-0 bg-primary/5 border-2 border-primary/30 rounded pointer-events-none" />
      )}
    </div>
  )
}
