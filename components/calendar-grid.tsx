"use client"

import type React from "react"

import { isSameMonth, isToday } from "date-fns"
import type { Task } from "@/types/task"
import { CalendarDay } from "./calendar-day"

interface CalendarGridProps {
  days: Date[]
  currentMonth: Date
  tasks: Task[]
  dragState: {
    isDragging: boolean
    startDate: Date | null
    endDate: Date | null
    dragStarted: boolean
  }
  taskDragState: {
    isDragging: boolean
    task: Task | null
    dragType: "move" | "resize-start" | "resize-end" | null
    originalDuration: number
    startOffset: number
  }
  onMouseDown: (date: Date, event: React.MouseEvent) => void
  onMouseEnter: (date: Date) => void
  onMouseUp: () => void
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

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function CalendarGrid({
  days,
  currentMonth,
  tasks,
  dragState,
  taskDragState,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  onTaskUpdate,
  onTaskDelete,
  onTaskDragStart,
  onTaskClick,
  onTaskDoubleClick,
}: CalendarGridProps) {
  return (
    <div className="select-none">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-px mb-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden"
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSelected =
            dragState.startDate && dragState.endDate && day >= dragState.startDate && day <= dragState.endDate

          const dayTasks = tasks.filter((task) => {
            const dayTime = day.getTime()
            const startTime = task.startDate.getTime()
            const endTime = task.endDate.getTime()
            return dayTime >= startTime && dayTime <= endTime
          })

          if (taskDragState.isDragging && taskDragState.task) {
            const dragTask = taskDragState.task
            const dayTime = day.getTime()
            const dragStartTime = dragTask.startDate.getTime()
            const dragEndTime = dragTask.endDate.getTime()

            if (dayTime >= dragStartTime && dayTime <= dragEndTime) {
              const filteredTasks = dayTasks.filter((t) => t.id !== dragTask.id)
              dayTasks.splice(0, dayTasks.length, ...filteredTasks, dragTask)
            }
          }

          return (
            <CalendarDay
              key={day.toISOString()}
              date={day}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday(day)}
              isSelected={isSelected}
              isDragging={dragState.isDragging}
              isTaskDragging={taskDragState.isDragging}
              tasks={dayTasks}
              onMouseDown={(event) => onMouseDown(day, event)}
              onMouseEnter={() => onMouseEnter(day)}
              onTaskUpdate={onTaskUpdate}
              onTaskDelete={onTaskDelete}
              onTaskDragStart={onTaskDragStart}
              onTaskClick={onTaskClick}
              onTaskDoubleClick={onTaskDoubleClick}
            />
          )
        })}
      </div>
    </div>
  )
}
