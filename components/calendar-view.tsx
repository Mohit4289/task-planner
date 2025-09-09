"use client"

import { useState, useCallback, useRef } from "react"
import type { Task, TaskFilters } from "@/types/task"
import { CalendarGrid } from "./calendar-grid"
import { CalendarHeader } from "./calendar-header"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  differenceInDays,
} from "date-fns"
import React from "react"

interface CalendarViewProps {
  tasks: Task[]
  filters: TaskFilters
  onDateRangeSelect: (start: Date, end: Date) => void
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete: (taskId: string) => void
  onTaskEdit?: (task: Task) => void
  onTaskSelect?: (task: Task) => void
}

export function CalendarView({
  tasks,
  filters,
  onDateRangeSelect,
  onTaskUpdate,
  onTaskDelete,
  onTaskEdit,
  onTaskSelect,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    startDate: Date | null
    endDate: Date | null
    dragStarted: boolean
  }>({
    isDragging: false,
    startDate: null,
    endDate: null,
    dragStarted: false,
  })

  const [taskDragState, setTaskDragState] = useState<{
    isDragging: boolean
    task: Task | null
    dragType: "move" | "resize-start" | "resize-end" | null
    originalDuration: number
    startOffset: number
  }>({
    isDragging: false,
    task: null,
    dragType: null,
    originalDuration: 0,
    startOffset: 0,
  })

  const isDraggingRef = useRef(false)
  const taskDragRef = useRef(false)

  // Generate calendar days
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  })

  // Filter tasks based on current filters
  const filteredTasks = tasks.filter((task) => {
    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(task.category)) {
      return false
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      const matchesName = task.name.toLowerCase().includes(query)
      const matchesDescription = task.description?.toLowerCase().includes(query) || false
      if (!matchesName && !matchesDescription) {
        return false
      }
    }

    // Time range filter
    if (filters.timeRange) {
      const now = new Date()
      const taskStart = task.startDate
      const daysDiff = Math.ceil((taskStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      switch (filters.timeRange) {
        case "1week":
          if (daysDiff > 7) return false
          break
        case "2weeks":
          if (daysDiff > 14) return false
          break
        case "3weeks":
          if (daysDiff > 21) return false
          break
      }
    }

    return true
  })

  const handlePrevMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1))
  }

  const handleMouseDown = useCallback((date: Date, event: React.MouseEvent) => {
    // Prevent default to avoid text selection
    event.preventDefault()

    // Only start drag if clicking on empty space (not on a task)
    const target = event.target as HTMLElement
    if (target.closest("[data-task-bar]")) {
      return
    }

    isDraggingRef.current = true
    setDragState({
      isDragging: true,
      startDate: date,
      endDate: date,
      dragStarted: true,
    })
  }, [])

  const handleMouseEnter = useCallback(
    (date: Date) => {
      if (dragState.isDragging && dragState.startDate && isDraggingRef.current) {
        const start = dragState.startDate <= date ? dragState.startDate : date
        const end = dragState.startDate <= date ? date : dragState.startDate

        setDragState((prev) => ({
          ...prev,
          startDate: start,
          endDate: end,
        }))
      }

      if (taskDragState.isDragging && taskDragState.task && taskDragRef.current) {
        const task = taskDragState.task

        if (taskDragState.dragType === "move") {
          // Calculate new start and end dates maintaining duration
          const newStartDate = new Date(date.getTime() + taskDragState.startOffset * 24 * 60 * 60 * 1000)
          const newEndDate = new Date(
            newStartDate.getTime() + (taskDragState.originalDuration - 1) * 24 * 60 * 60 * 1000,
          )

          setTaskDragState((prev) => ({
            ...prev,
            task: { ...task, startDate: newStartDate, endDate: newEndDate },
          }))
        } else if (taskDragState.dragType === "resize-start") {
          // Resize from start, don't let start go past end
          if (date <= task.endDate) {
            setTaskDragState((prev) => ({
              ...prev,
              task: { ...task, startDate: date },
            }))
          }
        } else if (taskDragState.dragType === "resize-end") {
          // Resize from end, don't let end go before start
          if (date >= task.startDate) {
            setTaskDragState((prev) => ({
              ...prev,
              task: { ...task, endDate: date },
            }))
          }
        }
      }
    },
    [dragState.isDragging, dragState.startDate, taskDragState],
  )

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging && dragState.startDate && dragState.endDate && dragState.dragStarted) {
      // Only create task if we actually dragged (not just clicked)
      const isSameDay = dragState.startDate.getTime() === dragState.endDate.getTime()

      // Allow single day selection or multi-day selection
      onDateRangeSelect(dragState.startDate, dragState.endDate)
    }

    if (taskDragState.isDragging && taskDragState.task && taskDragRef.current) {
      const updatedTask = taskDragState.task
      onTaskUpdate(updatedTask.id, {
        startDate: updatedTask.startDate,
        endDate: updatedTask.endDate,
      })
    }

    // Reset drag states
    isDraggingRef.current = false
    taskDragRef.current = false
    setDragState({
      isDragging: false,
      startDate: null,
      endDate: null,
      dragStarted: false,
    })
    setTaskDragState({
      isDragging: false,
      task: null,
      dragType: null,
      originalDuration: 0,
      startOffset: 0,
    })
  }, [dragState, taskDragState, onDateRangeSelect, onTaskUpdate])

  const handleGlobalMouseUp = useCallback(() => {
    if (isDraggingRef.current || taskDragRef.current) {
      handleMouseUp()
    }
  }, [handleMouseUp])

  const handleTaskDragStart = useCallback(
    (task: Task, dragType: "move" | "resize-start" | "resize-end", event: React.MouseEvent, clickedDate: Date) => {
      event.preventDefault()
      event.stopPropagation()

      taskDragRef.current = true
      const duration = differenceInDays(task.endDate, task.startDate) + 1
      const startOffset = differenceInDays(clickedDate, task.startDate)

      setTaskDragState({
        isDragging: true,
        task: { ...task },
        dragType,
        originalDuration: duration,
        startOffset,
      })
    },
    [],
  )

  const handleTaskClick = useCallback(
    (task: Task, event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()

      if (onTaskSelect) {
        onTaskSelect(task)
      }
    },
    [onTaskSelect],
  )

  const handleTaskDoubleClick = useCallback(
    (task: Task, event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()

      if (onTaskEdit) {
        onTaskEdit(task)
      }
    },
    [onTaskEdit],
  )

  React.useEffect(() => {
    if (dragState.isDragging || taskDragState.isDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp)
      document.addEventListener("mouseleave", handleGlobalMouseUp)

      return () => {
        document.removeEventListener("mouseup", handleGlobalMouseUp)
        document.removeEventListener("mouseleave", handleGlobalMouseUp)
      }
    }
  }, [dragState.isDragging, taskDragState.isDragging, handleGlobalMouseUp])

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <CalendarHeader currentDate={currentDate} onPrevMonth={handlePrevMonth} onNextMonth={handleNextMonth} />

      <CalendarGrid
        days={calendarDays}
        currentMonth={currentDate}
        tasks={filteredTasks}
        dragState={dragState}
        taskDragState={taskDragState}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseUp={handleMouseUp}
        onTaskUpdate={onTaskUpdate}
        onTaskDelete={onTaskDelete}
        onTaskDragStart={handleTaskDragStart}
        onTaskClick={handleTaskClick}
        onTaskDoubleClick={handleTaskDoubleClick}
      />
    </div>
  )
}
